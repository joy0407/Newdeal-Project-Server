module.exports = {
  isOwner:function(req,res){
    if(req.user){
      return true;
    } else {
      return false;
    }
  },
  statusUI:function(req,res){
    let authStatusUI = '<a href="/auth/login">login</a> | <a href="/auth/register">REGISTER</a> | <a href="/auth/google">Google</a> | <a href="/auth/naver">Naver</a> | <a href="/auth/kakao">Kakao</a>'
    if(this.isOwner(req, res)){
      authStatusUI = `${req.user.displayName} | <a href="/auth/logout">logout</a>`;
    }
    return authStatusUI;
  }
};
