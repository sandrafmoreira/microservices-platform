from fastapi import APIRouter, Depends
from models.notes_model import Notes
from fastapi import Depends
from controllers.notes_controller import notes_controller
from controllers.auth_controller import authenticate_token
from pydantic import BaseModel


# Schema to create/edit (user input)
class NotesCreate(BaseModel):
    content: str
    #product_seller_id: int
    quantity: int

# Creates /deliveries endpoint (tag is for Swagger)
router = APIRouter( prefix = "/notes", tags = ["Notes"])

# GET /notes/:id
@router.get("/{user_id}")
async def get_note_by_user(user_id: str, user = Depends(authenticate_token)):
    return await notes_controller.get_one(user_id, user)


# POST /notes
@router.post("/{user_id}")
async def create_note(user_id: str, body: NotesCreate, user = Depends(authenticate_token)):
    return await notes_controller.create_one(user_id, body, user)


# PUT /notes/:id
@router.put("/{note_id}")
async def edit_note(note_id: str, body: NotesCreate, user = Depends(authenticate_token)):
    return await notes_controller.edit_one(note_id, body, user)


# DELETE /notes/:id
@router.delete("/{note_id}")
async def delete_note(note_id: str, user = Depends(authenticate_token)):
    return await notes_controller.delete_one(note_id, user)