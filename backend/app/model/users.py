from typing import List, Optional
from sqlalchemy import Column, String
from sqlmodel import SQLModel, Field

class Users(SQLModel,table=True):
    __tablename__= "users"

    id: Optional[str] = Field(None, primary_key=True, nullable=False)
    name: str = Field(sa_column=Column("name", String))
    email: str = Field(sa_column=Column("email", String, unique=True))
    password: str