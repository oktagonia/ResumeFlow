from fastapi import BackgroundTasks, FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from typing import Dict, Any, List
from models import Section, Item, BulletPoint
from semaphore import compilation_semaphore
from pdf_utils import compile_pdf, cleanup_temp_dir

import uuid
import latex
import os
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000', 'http://54.160.150.233:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

sections: List[Section] = []  # Changed type hint back to List[Section]


def generate_id() -> str:
    return str(uuid.uuid4())


@app.get('/sections')
# Ensure return type matches sections list type
async def get_sections() -> Dict[str, List[Section]]:
    return {"sections": sections}


@app.post('/sections/add-section')
async def add_section() -> Dict[str, Section]:
    section_id = generate_id()
    default_json = {"type": "doc", "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "New Section"}]}]}

    new_section = Section(
        id=section_id,
        type="Section",
        title="New Section",
        status=True,
        isCollapsed=False,
        json=default_json,
        items=[]
    )
    sections.append(new_section)
    return {"section": new_section}


@app.post('/sections/add-latex')
async def add_latex_section() -> Dict[str, Section]:
    section_id = generate_id()

    new_latex_section = Section(
        id=section_id,
        type="LaTeX",
        title="",
        status=True,
        isCollapsed=False,
        json=None,
        items=[]
    )

    sections.append(new_latex_section)
    return {"section": new_latex_section}


@app.post("/sections/{section_id}/update-latex")
async def update_latex(section_id: str, data: Dict[str, Any] = Body(...)) -> Section:
    for section in sections:
        if section.id != section_id:
            continue

        section.json = data['text']
        return section

    raise HTTPException(status_code=400, detail='Section not found')


@app.delete('/sections/{section_id}')
async def remove_section(section_id: str) -> Dict[str, str]:
    for i, section in enumerate(sections):
        if section.id != section_id:
            continue

        sections.pop(i)
        return {"message": "Section deleted successfully"}

    raise HTTPException(status_code=404, detail="Section not found")


@app.patch('/sections/{section_id}/status')
async def toggle_section_status(section_id: str) -> Dict[str, Section]:
    for section in sections:
        if section.id != section_id:
            continue

        section.status = not section.status
        return {"section": section}

    raise HTTPException(status_code=404, detail="Section not found")


@app.patch('/sections/{section_id}/title')
async def update_section_title(section_id: str, data: Dict[str, Any] = Body(...)) -> Dict[str, Section]:
    for section in sections:
        if section.id != section_id:
            continue

        if 'title' in data:
            section.title = data['title']
        if 'json' in data:
            section.json = data['json']
        return {"section": section}

    raise HTTPException(status_code=404, detail="Section not found")


@app.post('/sections/{section_id}/items')
async def add_item(section_id: str) -> Dict[str, Item]:
    for section in sections:
        if section.id != section_id:
            continue

        item_id = generate_id()
        default_title_json = {"type": "doc", "content": [
            {"type": "paragraph", "content": [{"type": "text", "text": "New Item"}]}]}
        default_org_json = {"type": "doc", "content": [
            {"type": "paragraph", "content": [{"type": "text", "text": "Organization"}]}]}

        new_item = Item(
            id=item_id,
            type="Item",
            title="New Item",
            organization="Organization",
            status=True,
            isCollapsed=False,
            titleJSON=default_title_json,
            organizationJSON=default_org_json,
            bulletPoints=[]
        )

        section.items.append(new_item)
        return {"item": new_item}

    raise HTTPException(status_code=404, detail="Section not found")


@app.patch('/sections/{section_id}/items/{item_id}/status')
async def toggle_item_status(section_id: str, item_id: str) -> Dict[str, Item]:
    for section in sections:
        if section.id != section_id:
            continue

        for item in section.items:
            if item.id != item_id:
                continue

            item.status = not item.status
            return {"item": item}

        raise HTTPException(status_code=404, detail="Item not found")

    raise HTTPException(status_code=404, detail="Section not found")


@app.patch('/sections/{section_id}/items/{item_id}')
async def update_item(section_id: str, item_id: str, updated_fields: Dict[str, Any] = Body(...)) -> Dict[str, Item]:
    for section in sections:
        if section.id != section_id:
            continue

        for item in section.items:
            if item.id != item_id:
                continue

            # Update only the fields that are provided in the request body
            for field, value in updated_fields.items():
                if hasattr(item, field):
                    setattr(item, field, value)
            return {"item": item}

        raise HTTPException(status_code=404, detail="Item not found")

    raise HTTPException(status_code=404, detail="Section not found")


@app.post('/sections/{section_id}/items/{item_id}/bullets')
async def add_bullet_point(section_id: str, item_id: str) -> Dict[str, BulletPoint]:
    for section in sections:
        if section.id != section_id:
            continue

        for item in section.items:
            if item.id != item_id:
                continue

            bullet_id = generate_id()
            default_json = {"type": "doc", "content": [
                {"type": "paragraph", "content": [{"type": "text", "text": "New Bullet Point"}]}]}

            new_bullet = BulletPoint(
                id=bullet_id,
                type="BulletPoint",
                text="New Bullet Point",
                status=True,
                json=default_json
            )
            item.bulletPoints.append(new_bullet)
            return {"bullet": new_bullet}

        raise HTTPException(status_code=404, detail="Item not found")

    raise HTTPException(status_code=404, detail="Section not found")


@app.patch('/sections/{section_id}/items/{item_id}/bullets/{bullet_id}/status')
async def toggle_bullet_status(section_id: str, item_id: str, bullet_id: str) -> Dict[str, BulletPoint]:
    for section in sections:
        if section.id != section_id:
            continue
        for item in section.items:
            if item.id != item_id:
                continue
            for bullet in item.bulletPoints:
                if bullet.id != bullet_id:
                    continue
                bullet.status = not bullet.status
                return {"bullet": bullet}
            raise HTTPException(
                status_code=404, detail="Bullet point not found")
        raise HTTPException(status_code=404, detail="Item not found")
    raise HTTPException(status_code=404, detail="Section not found")


@app.patch('/sections/{section_id}/items/{item_id}/bullets/{bullet_id}/text')
async def update_bullet_text(section_id: str, item_id: str, bullet_id: str, data: Dict[str, Any] = Body(...)) -> Dict[str, BulletPoint]:
    for section_object in sections:  # Renamed section to section_object to avoid conflict with models.Section
        if section_object.id != section_id:
            continue

        for item in section_object.items:
            if item.id != item_id:
                continue

            for bullet in item.bulletPoints:
                if bullet.id != bullet_id:
                    continue

                if 'text' in data:
                    bullet.text = data['text']
                if 'json' in data:
                    bullet.json = data['json']
                return {"bullet": bullet}

            raise HTTPException(
                status_code=404, detail="Bullet point not found")

        raise HTTPException(status_code=404, detail="Item not found")
    raise HTTPException(status_code=404, detail="Section not found")


@app.post('/pdf')
async def get_pdf(background_tasks: BackgroundTasks, request_body=Body(...)):
    try:
        sections_json = request_body.get('sections_json', request_body)

        async with compilation_semaphore:
            pdf_path, temp_dir = await compile_pdf(sections_json)

        with open(pdf_path, 'rb') as f:
            pdf_content = f.read()

        background_tasks.add_task(cleanup_temp_dir, temp_dir)

        return Response(
            content=pdf_content,
            media_type='application/pdf',
            headers={'Content-Disposition': 'inline; filename=resume.pdf'}
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'PDF Generation failed: {str(e)}'
        )
