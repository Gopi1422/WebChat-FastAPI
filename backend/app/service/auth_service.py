from uuid import uuid4
from fastapi import HTTPException

from passlib.context import CryptContext
from app.schema import RegisterSchema, LoginSchema, ForgotPasswordSchema
from app.model import Users
from app.repository.users import UsersRepository
from app.repository.auth_repo import JWTRepo


# Encrypt password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:

    @staticmethod
    async def register_service(register: RegisterSchema):

        # Create uuid
        _users_id = str(uuid4())

        # mapping request data to class entity table
        _users = Users(id=_users_id, name=register.name, email=register.email,
                       password=pwd_context.hash(register.password))

        # Cheking the same email
        _email = await UsersRepository.find_by_email(register.email)
        if _email:
            raise HTTPException(
                status_code=400, detail="Email already exists!")

        else:
            #  insert to tables
            await UsersRepository.create(**_users.dict())

    @staticmethod
    async def logins_service(login: LoginSchema):
        _email = await UsersRepository.find_by_email(login.email)

        if _email is not None:
            if not pwd_context.verify(login.password, _email.password):
                raise HTTPException(
                    status_code=400, detail="Invalid Password !")
            return JWTRepo(data={"email": _email.email}).generate_token()
        raise HTTPException(status_code=404, detail="Email not found !")

    @staticmethod
    async def forgot_password_service(forgot_password: ForgotPasswordSchema):
        _email = await UsersRepository.find_by_email(forgot_password.email)
        if _email is None:
            raise HTTPException(status_code=404, detail="Email not found !")
        await UsersRepository.update_password(forgot_password.email, pwd_context.hash(forgot_password.new_password))
