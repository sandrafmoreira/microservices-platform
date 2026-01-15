from beanie import Document
from typing import Optional
from bson import ObjectId

class Notes(Document):
    user_id: str
    content: str
    quantity: int
    #product_seller_id: Optional[str] = None

    class Settings:
        name = "notes" 