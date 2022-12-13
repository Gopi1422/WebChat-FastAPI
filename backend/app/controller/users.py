from fastapi import APIRouter,Depends,Security

from app.schema import ResponseSchema
from app.repository.auth_repo import JWTBearer, JWTRepo
from fastapi.security import HTTPAuthorizationCredentials
from app.service.users import UserService

router = APIRouter(
    prefix="/users",
    tags=['user'],
    dependencies=[Depends(JWTBearer())]
)


@router.get("/", response_model=ResponseSchema, response_model_exclude_none=True)
async def get_user_profile(credentials: HTTPAuthorizationCredentials = Security(JWTBearer())):
    token = JWTRepo.extract_token(credentials)  # {'email': 'john@gmail.com', 'exp': 1670863327}
    result = await UserService.get_user_profile(token['email'])
    return ResponseSchema(detail="Successfully fetch data!", result=result)