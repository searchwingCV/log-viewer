from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_storage
from ..internal.logging import get_logger
from ..internal.storage import Storage
from ..models.metadata import Flight, LogFile

logger = get_logger(__name__)
router = APIRouter(
    prefix="/log",
    tags=["log"],
    responses={404: {"description": "Not found"}},
)


@router.post("/<flight_id>")
def upload(flight_id: int, file: UploadFile, storage: Storage = Depends(get_storage), db: Session = Depends(get_db)):
    flight = db.query(Flight).filter_by(flight_id=flight_id).first()
    if flight:
        try:
            if flight is not None:
                path = f"log/{flight_id}/{file.filename}"
                storage.fs.makedirs(f"log/{flight_id}", exist_ok=True)
                uri = storage.get_uri(path)
                log_db = LogFile(flight_id=flight_id, file_uri=uri)
                db.add(log_db)
                db.commit()
                file_stream = file.file.read()
                storage.save(BytesIO(file_stream), path)
        except Exception as err:
            logger.exception("Exception detected!")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err))
        return {"message": f"Successfully uploaded {file.filename}"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fight does not exist: {flight_id=}",
        )
