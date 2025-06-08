from fastapi import FastAPI, HTTPException, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import uuid

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

sections = {}

def generate_id():
    return str(uuid.uuid4())

@app.get('/sections')
async def get_sections():
    return {'sections': sections}

@app.post('/sections/add-section')
async def add_section():
    section_id = generate_id()
    new_section = {
        "id": section_id,
        "title": "New Section",
        "status": True,
        "isCollapsed": False,
        "items": []
    }
    sections[section_id] = new_section
    return {"section": new_section}

@app.delete('/sections/{section_id}')
async def remove_section(section_id: str):
    if section_id not in sections:
        raise HTTPException(status_code=404, detail="Section not found")
    
    del sections[section_id]
    return {"message": "Section deleted successfully"}

@app.patch('/sections/{section_id}/status')
async def toggle_section_status(section_id: str):
    if section_id not in sections:
        raise HTTPException(status_code=404, detail="Section not found")
    
    sections[section_id]["status"] = not sections[section_id]["status"]
    return {"section": sections[section_id]}

@app.patch('/sections/{section_id}/title')
async def update_section_title(section_id: str, title: str = Body(..., embed=True)):
    if section_id not in sections:
        raise HTTPException(status_code=404, detail="Section not found")
    sections[section_id]["title"] = title
    return {"section": sections[section_id]}

@app.post('/sections/{section_id}/items')
async def add_item(section_id: str):
    if section_id not in sections:
        raise HTTPException(status_code=404, detail="Section not found")
    
    item_id = generate_id()
    new_item = {
        "id": item_id,
        "title": "New Item",
        "organization": "Organization",
        "startDate": "",
        "endDate": "",
        "location": "",
        "status": True,
        "isCollapsed": False,
        "bulletPoints": []
    }
    
    sections[section_id]["items"].append(new_item)
    return {"item": new_item}

@app.patch('/sections/{section_id}/items/{item_id}/status')
async def toggle_item_status(section_id: str, item_id: str):
    if section_id not in sections:
        raise HTTPException(status_code=404, detail="Section not found")
    
    for item in sections[section_id]["items"]:
        if item["id"] == item_id:
            item["status"] = not item["status"]
            return {"item": item}
    
    raise HTTPException(status_code=404, detail="Item not found")

@app.patch('/sections/{section_id}/items/{item_id}')
async def update_item(section_id: str, item_id: str):
    pass

@app.post('/sections/{section_id}/items/{item_id}/bullets')
async def add_bullet_point(section_id: str, item_id: str):
    if section_id not in sections:
        raise HTTPException(status_code=404, detail="Section not found")
    
    for item in sections[section_id]["items"]:
        if item["id"] == item_id:
            bullet_id = generate_id()
            new_bullet = {
                "id": bullet_id,
                "text": "New bullet point",
                "status": True
            }
            item["bulletPoints"].append(new_bullet)
            return {"bullet": new_bullet}
    
    raise HTTPException(status_code=404, detail="Item not found")

@app.patch('/sections/{section_id}/items/{item_id}/bullets/{bullet_id}/status')
async def toggle_bullet_status(section_id: str, item_id: str, bullet_id: str):
    if section_id not in sections:
        raise HTTPException(status_code=404, detail="Section not found")
    
    for item in sections[section_id]["items"]:
        if item["id"] != item_id:
            continue
            
        for bullet in item["bulletPoints"]:
            if bullet["id"] != bullet_id:
                continue
            bullet["status"] = not bullet["status"]
            return {"bullet": bullet}
        
        raise HTTPException(status_code=404, detail="Bullet point not found")
    
    raise HTTPException(status_code=404, detail="Item not found")

@app.patch('/sections/{section_id}/items/{item_id}/bullets/{bullet_id}/text')
async def update_bullet_text(section_id: str, item_id: str, bullet_id: str):
    pass

@app.post('/resume/save')
async def save_resume():
    pass
