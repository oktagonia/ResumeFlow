from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class BulletPoint(BaseModel):
    id: str
    type: str = "Bullet"
    text: str
    html: Optional[str] = None
    json: Optional[Dict[str, Any]] = None
    status: bool = True


class Item(BaseModel):
    id: str
    type: str = "Item"
    title: str
    organization: str
    startDate: str = ""
    endDate: str = ""
    location: str = ""
    status: bool = True
    isCollapsed: bool = False
    titleJSON: Optional[Dict[str, Any]] = None
    organizationJSON: Optional[Dict[str, Any]] = None
    bulletPoints: List[BulletPoint] = []


class Section(BaseModel):
    id: str
    type: str = "Section"
    title: str
    status: bool = True
    isCollapsed: bool = False
    json: Optional[Dict[str, Any]] = None
    items: List[Item] = []


class Resume(BaseModel):
    sections: List[Section] = []
