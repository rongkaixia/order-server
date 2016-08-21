import Express from 'express';
import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import CaptainClient from 'echo-common/api/captain/CaptainClient';
import API from 'echo-common/api/api';
import ErrorMessage from '../error';
import Cookies from '../cookies';
import Config from '../Config';
// let protocol = require('protocol');
const protocol = require('../../lib/protocol/protocol_pb');
const captainClient = new CaptainClient();

function checkPassword(password){
	return true
}

function checkPhonenum(phonenum){
	return true
}

let router = Express.Router();
router.use(BodyParser.json()); // for parsing application/json
router.use(BodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(CookieParser())

// clear cookie function
let clearCookie = (req, res) => {
  if (req.cookies && req.cookies[Cookies.username])
    res.clearCookie(Cookies.username);
  if (req.cookies && req.cookies[Cookies.session])
    res.clearCookie(Cookies.session);
  if (req.cookies && req.cookies[Cookies.userID])
    res.clearCookie(Cookies.userID);
  if (req.cookies && (req.cookies[Cookies.loggedIn] == 'true' || req.cookies[Cookies.loggedIn] == true))
    res.cookie(Cookies.loggedIn, false, { domain: '.' + Config.mainDomain});
}

let setCookie = (res, {username, token, userId}) => {
  res.cookie(Cookies.username, username, { domain: '.' + Config.mainDomain});
  res.cookie(Cookies.session, token, { domain: '.' + Config.mainDomain});
  res.cookie(Cookies.userID, userId, { domain: '.' + Config.mainDomain});
  res.cookie(Cookies.loggedIn, true, { domain: '.' + Config.mainDomain});
}

router.post(API.SIGNUP_API_PATH, (req, res) => {
  console.log("handle signup request: " + req.body);
  // check input
  
  // construct signup request
  let signupReq = new protocol.Request.SignupRequest();
  signupReq.setPhonenum(req.body.username);
  signupReq.setPassword(req.body.password);
  let request = new protocol.Request();
  request.setSignupRequest(signupReq);
  console.log("send request to Captain Server")
  console.log("request: " + JSON.stringify(request.toObject()))

  // send request to backend server
  captainClient.post(request)
  .then((response)=>{
		console.log("recieve response from Captain Server: " + JSON.stringify(response.toObject()))
		let errorMsg = new ErrorMessage(response.getResult(), response.getErrorDescription()).toObject();
		let result = {};
		if (response.getResult() != protocol.ResultCode.SUCCESS){
			result = {...result, ...errorMsg};
  	}else{
      let data = response.getSignupResponse().toObject();
  		result = {...result, ...errorMsg, ...{data:data}};
      setCookie(res, {username: data.username, token: data.token, userId: data.userId});
  	}
  	console.log("send response: " + JSON.stringify(result));
  	res.json(result);
  })
  .catch(err => {
    console.log("handle response from Captain Server error: " + err);
  	let errorMsg = new ErrorMessage(protocol.ResultCode.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
  	console.log(errorMsg.toObject());
  	res.json(errorMsg.toObject());
  })
})

router.post(API.LOGIN_API_PATH, (req, res) => {
  console.log("handle login request: " + req.body);
  // check input
  
  // construct login request
  let loginReq = new protocol.Request.LoginRequest();
  loginReq.setPhonenum(req.body.username);
  loginReq.setPassword(req.body.password);
  let request = new protocol.Request();
  request.setLoginRequest(loginReq);
  console.log("send request to Captain Server")
  console.log("request: " + JSON.stringify(request.toObject()))

  // send request to backend server
  captainClient.post(request)
  .then((response)=>{
		console.log("recieve response from Captain Server: " + JSON.stringify(response.toObject()))
		let errorMsg = new ErrorMessage(response.getResult(), response.getErrorDescription()).toObject();
		let result = {};
		if (response.getResult() != protocol.ResultCode.SUCCESS){
			result = {...result, ...errorMsg};
  	}else{
      let data = response.getLoginResponse().toObject();
  		result = {...result, ...errorMsg, ...{data:data}};
      setCookie(res, {username: data.username, token: data.token, userId: data.userId});
  	}
  	console.log("send response: " + JSON.stringify(result));
  	res.json(result);
  })
  .catch(err => {
    console.log("handle response from Captain Server error: " + err);
  	let errorMsg = new ErrorMessage(protocol.ResultCode.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
  	console.log(errorMsg.toObject());
  	res.json(errorMsg.toObject());
  })
})

router.get(API.VALIDATE_TOKEN_API_PATH, (req, res) => {
  console.log("handle validate token request: " + JSON.stringify(req.cookies));
  // check input
  
  // construct login request
  let authReq = new protocol.Request.AuthenticationRequest();
  authReq.setToken(req.cookies[Cookies.session]);
  let request = new protocol.Request();
  request.setAuthenticationRequest(authReq);
  console.log("send request to Captain Server")
  console.log("request: " + JSON.stringify(request.toObject()))

  // send request to backend server
  captainClient.post(request)
  .then((response)=>{
    console.log("recieve response from Captain Server: " + JSON.stringify(response.toObject()))
    let errorMsg = new ErrorMessage(response.getResult(), response.getErrorDescription()).toObject();
    let result = {};
    if (response.getResult() != protocol.ResultCode.SUCCESS){
      result = {...result, ...errorMsg};
      // TODO: clear cookies
      // clearCookie(req, res);
    }else{
      let data = response.getAuthenticationResponse().toObject();
      result = {...result, ...errorMsg, ...{data:data}};
      if (data.isExpired == true) {
        clearCookie(req, res);
      }
    }
    console.log("send response: " + JSON.stringify(result));
    res.json(result);
  })
  .catch(err => {
    console.log("handle response from Captain Server error: " + err);
    let errorMsg = new ErrorMessage(protocol.ResultCode.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
    console.log(errorMsg.toObject());
    // TODO: clear cookies
    // clearCookie(req, res);
    res.json(errorMsg.toObject());
  })
})

router.post(API.LOGOUT_API_PATH, (req, res) => {
  console.log("handle logout request: " + JSON.stringify(req.cookies));
  // check input
  
  // construct login request
  let logoutReq = new protocol.Request.LogoutRequest();
  logoutReq.setToken(req.cookies[Cookies.session]);
  let request = new protocol.Request();
  request.setLogoutRequest(logoutReq);
  console.log("send request to Captain Server")
  console.log("request: " + JSON.stringify(request.toObject()))

  // send request to backend server
  captainClient.post(request)
  .then((response)=>{
    console.log("recieve response from Captain Server: " + JSON.stringify(response.toObject()))
    let errorMsg = new ErrorMessage(response.getResult(), response.getErrorDescription()).toObject();
    let result = {};
    if (response.getResult() != protocol.ResultCode.SUCCESS){
      result = {...result, ...errorMsg};
    }else{
      let data = response.getLogoutResponse().toObject();
      result = {...result, ...errorMsg, ...{data:data}};
      clearCookie(req, res);
    }
    console.log("send response: " + JSON.stringify(result));
    res.json(result);
  })
  .catch(err => {
    console.log("handle response from Captain Server error: " + err);
    let errorMsg = new ErrorMessage(protocol.ResultCode.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
    console.log(errorMsg.toObject());
    res.json(errorMsg.toObject());
  })
})

router.get(API.USER_INFO_API_PATH, (req, res) => {
  console.log("handle query user info request: " + JSON.stringify(req.cookies));
  // check input
  
  // construct login request
  let queryReq = new protocol.Request.QueryUserInfoRequest();
  queryReq.setToken(req.cookies[Cookies.session]);
  let request = new protocol.Request();
  request.setQueryUserInfoRequest(queryReq);
  console.log("send request to Captain Server")
  console.log("request: " + JSON.stringify(request.toObject()))

  // send request to backend server
  captainClient.post(request)
  .then((response)=>{
    console.log("recieve response from Captain Server: " + JSON.stringify(response.toObject()))
    let errorMsg = new ErrorMessage(response.getResult(), response.getErrorDescription()).toObject();
    let result = {};
    if (response.getResult() != protocol.ResultCode.SUCCESS){
      result = {...result, ...errorMsg};
    }else{
      let data = response.getQueryUserInfoResponse().toObject();
      result = {...result, ...errorMsg, ...{data:data}};
    }
    console.log("send response: " + JSON.stringify(result));
    res.json(result);
  })
  .catch(err => {
    console.log("handle response from Captain Server error: " + err);
    let errorMsg = new ErrorMessage(protocol.ResultCode.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
    console.log(errorMsg.toObject());
    res.json(errorMsg.toObject());
  })
})

router.post(API.USER_INFO_API_PATH + '/:suffix', (req, res) => {
  console.log("handle update user info request(" + req.params.suffix + "): " + JSON.stringify(req.cookies));
  // check input

  // construct request
  let data = new protocol.Request.UpdateUserInfoRequest.UpdateData
  let request = new protocol.Request();
  if (req.params.suffix === API.USER_INFO_API_USERNAME_SUFFIX) {
    let r = new protocol.Request.UpdateUserInfoRequest();
    data.setUsername(req.body.newUsername);
    r.setToken(req.cookies[Cookies.session]);
    r.setDataList([data])
    request.setUpdateUserInfoRequest(r);
  } else if (req.params.suffix === API.USER_INFO_API_PHONENYM_SUFFIX) {
    let r = new protocol.Request.UpdateUserInfoRequest();
    data.setPhonenum(req.body.newPhonenum);
    r.setToken(req.cookies[Cookies.session]);
    r.setDataList([data])
    request.setUpdateUserInfoRequest(r);
  } else if (req.params.suffix === API.USER_INFO_API_EMAIL_SUFFIX) {
    let r = new protocol.Request.UpdateUserInfoRequest();
    data.setEmail(req.body.newEmail);
    r.setToken(req.cookies[Cookies.session]);
    r.setDataList([data])
    request.setUpdateUserInfoRequest(r);
  } else if (req.params.suffix === API.USER_INFO_API_PASSWORD_SUFFIX) {
    let r = new protocol.Request.UpdateUserInfoRequest();
    data.setPassword(req.body.newPassword);
    r.setToken(req.cookies[Cookies.session]);
    // r.setOldPassword(req.body.oldPassword);
    r.setDataList([data])
    request.setUpdateUserInfoRequest(r);
  }else {
    console.log("ERROR: not supported path " + API.USER_INFO_API_PATH + '/' + req.params.suffix);
    let errorMsg = new ErrorMessage(protocol.ResultCode.REQUEST_RESOURCE_NOT_FOUND, 
                                    "request resource " + API.USER_INFO_API_PATH + req.params.suffix +
                                    " not found").toObject();
    return;
  }

  console.log("send request to Captain Server")
  console.log("request: " + JSON.stringify(request.toObject()))

  // send request to backend server
  captainClient.post(request)
  .then((response)=>{
    // console.log("recieve response from Captain Server: " + JSON.stringify(response.toObject()))
    let errorMsg = new ErrorMessage(response.getResult(), response.getErrorDescription()).toObject();
    let result = {...errorMsg};
    console.log("send response: " + JSON.stringify(result));
    res.json(result);
  })
  .catch(err => {
    console.log("handle response from Captain Server error: " + err);
    let errorMsg = new ErrorMessage(protocol.ResultCode.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
    console.log(errorMsg.toObject());
    res.json(errorMsg.toObject());
  })
})

router.delete(API.USER_ADDRESS_API_PATH, (req, res) => {
  console.log("handle delete user address request(" + req.params.suffix + "): " + JSON.stringify(req.cookies));
  // check input

  // construct request
  let request = new protocol.Request();
  console.log("========delete address ===========");
  let r = new protocol.Request.DeleteUserAddressRequest();
  r.setToken(req.cookies[Cookies.session]);
  r.setId(req.body.id);
  request.setDeleteUserAddressRequest(r);

  console.log("send request to Captain Server")
  console.log("request: " + JSON.stringify(request.toObject()))

  // send request to backend server
  captainClient.post(request)
  .then((response)=>{
    // console.log("recieve response from Captain Server: " + JSON.stringify(response.toObject()))
    let errorMsg = new ErrorMessage(response.getResult(), response.getErrorDescription()).toObject();
    let result = {...errorMsg};
    console.log("send response: " + JSON.stringify(result));
    res.json(result);
  })
  .catch(err => {
    console.log("handle response from Captain Server error: " + err);
    let errorMsg = new ErrorMessage(protocol.ResultCode.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
    console.log(errorMsg.toObject());
    res.json(errorMsg.toObject());
  })
})


router.post(API.USER_ADDRESS_API_PATH, (req, res) => {
  console.log("handle add user address request(" + req.params.suffix + "): " + JSON.stringify(req.cookies));
  // check input

  // construct request
  let request = new protocol.Request();
  console.log("========add address ===========");
  let r = new protocol.Request.AddUserAddressRequest();
  r.setToken(req.cookies[Cookies.session]);
  r.setRecipientsName(req.body.recipientsName);
  r.setRecipientsPhone(req.body.recipientsPhone);
  r.setRecipientsAddress(req.body.recipientsAddress);
  request.setAddUserAddressRequest(r);

  console.log("send request to Captain Server")
  console.log("request: " + JSON.stringify(request.toObject()))

  // send request to backend server
  captainClient.post(request)
  .then((response)=>{
    // console.log("recieve response from Captain Server: " + JSON.stringify(response.toObject()))
    let errorMsg = new ErrorMessage(response.getResult(), response.getErrorDescription()).toObject();
    let result = {...errorMsg};
    console.log("send response: " + JSON.stringify(result));
    res.json(result);
  })
  .catch(err => {
    console.log("handle response from Captain Server error: " + err);
    let errorMsg = new ErrorMessage(protocol.ResultCode.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
    console.log(errorMsg.toObject());
    res.json(errorMsg.toObject());
  })
})


router.put(API.USER_ADDRESS_API_PATH, (req, res) => {
  console.log("handle modify user address request(" + req.params.suffix + "): " + JSON.stringify(req.cookies));
  // check input

  // construct request
  let request = new protocol.Request();
  console.log("========modify address ===========");
  let r = new protocol.Request.UpdateUserAddressRequest();
  r.setToken(req.cookies[Cookies.session]);
  r.setId(req.body.id);
  r.setRecipientsName(req.body.recipientsName);
  r.setRecipientsPhone(req.body.recipientsPhone);
  r.setRecipientsAddress(req.body.recipientsAddress);
  request.setUpdateUserAddressRequest(r);

  console.log("send request to Captain Server")
  console.log("request: " + JSON.stringify(request.toObject()))

  // send request to backend server
  captainClient.post(request)
  .then((response)=>{
    // console.log("recieve response from Captain Server: " + JSON.stringify(response.toObject()))
    let errorMsg = new ErrorMessage(response.getResult(), response.getErrorDescription()).toObject();
    let result = {...errorMsg};
    console.log("send response: " + JSON.stringify(result));
    res.json(result);
  })
  .catch(err => {
    console.log("handle response from Captain Server error: " + err);
    let errorMsg = new ErrorMessage(protocol.ResultCode.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
    console.log(errorMsg.toObject());
    res.json(errorMsg.toObject());
  })
})
export default router
