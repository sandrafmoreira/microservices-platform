from loguru import logger
from fastapi import HTTPException
from models.notes_model import Notes
from controllers.auth_controller import authenticate_token
from pydantic import BaseModel


class NotesController:

    # Get notes by user ID 
    async def get_one(self, user_id, user):
        logger.info(f"Request: GET /notes/{id} received!")

        # Query
        note = await Notes.find(Notes.user_id == user_id).to_list()
        

        # Check 404 error (no notes found)
        if not note:
            logger.warning(f'Note with user ID {id} was not found')
            raise HTTPException(
                status_code = 404, 
                detail = {"error": f"Note for user with ID {user_id} not found!"})

        # Check 403 error (no authorization)
        if user["id"] != user_id and user["role"] != "admin":
            raise HTTPException(
                status_code = 403,
                detail = {"error": f"Cannot see the notes from another user!"}
            )

        # 200 OK
        logger.info(f"Note for user with ID {user_id} returned successfully.")
        return {f"Note for user {user_id}": note}


    # Create a new note
    async def create_one(self, user_id, body, user):
        logger.info(f"Request POST /notes received!")

        if user["id"] != user_id:
            raise HTTPException(
                status_code = 403,
                detail = {"error": f"Cannot create a note for another user!"}
            )
        
        # Create note
        new_note = Notes(
            user_id = user_id,
            content = body.content,
            #product_seller_id = body.product_seller_id,
            quantity = body.quantity 
        )

        # Save changes
        await new_note.insert()

        logger.info("New note successfully created!")
        return{
            "message": "New note created successfully!",
            "note": new_note
        }
        

    async def edit_one(self, note_id, body, user):
        logger.info(f"Request POST /notes received!")

        # Query
        note = await Notes.get(note_id)

        # Check 404 error (no notes found)
        if not note:
            logger.warning(f'Note  with ID {note_id} not found!')
            raise HTTPException(
                status_code = 404, 
                detail = {"error": f"Note  with ID {note_id} not found!"})
        

        # Check 403 error (no authorization)
        if user["id"] != note.user_id and user["role"] != "admin":
            logger.warning('Cannot edit the notes from another user!')
            raise HTTPException(
                status_code = 403,
                detail = {"error": "Cannot edit the notes from another user!"}
            )

         # Update fields
        note.content = body.content
        note.quantity = body.quantity
        #note.product_seller_id = body.product_seller_id

        # Save changes
        await note.save()

        logger.info(f"Note with ID {note_id} successfully updated!")

        return {
            "message": "Note updated successfully!",
            "note": note
        }


    async def delete_one(self, note_id, user):
        logger.info(f"Request: DELETE /deliveries/{id}")
        
        # FIND query
        note = await Notes.get(note_id)

        # Check 404 error (no notes found)
        if not note:
            logger.warning(f'Note  with ID {note_id} not found!')
            raise HTTPException(
                status_code = 404, 
                detail = {"error": f"Note  with ID {note_id} not found!"})
        
         # Check 403 error (no authorization)
        if user["id"] != note.user_id and user["role"] != "admin":
            logger.warning('Cannot edit the notes from another user!')
            raise HTTPException(
                status_code = 403,
                detail = {"error": "Cannot edit the notes from another user!"}
            )

        # Remove note
        await note.delete()
        logger.info(f"Note with ID {note_id} deleted successfully!")

        return {
            "message": "Note deleted successfully!"
        }

notes_controller = NotesController()