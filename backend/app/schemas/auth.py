from datetime import datetime

from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)
    role: UserRole = UserRole.WAREHOUSE_MANAGER
    organization: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: UserRole
    organization: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


TokenResponse.model_rebuild()  # Ensure forward ref works
