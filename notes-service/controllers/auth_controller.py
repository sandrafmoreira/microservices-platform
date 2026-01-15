import os
import jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt.exceptions import InvalidTokenError

security = HTTPBearer(auto_error = False)

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

async def authenticate_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    
    # 401 error (no token provided)
    if credentials is None:
        raise HTTPException(status_code=401, detail={"error": "Unauthorized - token missing"}
        )

    token = credentials.credentials


    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload # req.user -> Node
    except InvalidTokenError:
        raise HTTPException(status_code = 403, detail = "Invalid or expired token")
