
class ErrorMessage{
  constructor(code, desc){
    this.code = code;
    this.desc = desc;
  }
  toObject(){
    return {errorCode: this.code, errorDescription: this.desc};
  }
}

export default ErrorMessage;
