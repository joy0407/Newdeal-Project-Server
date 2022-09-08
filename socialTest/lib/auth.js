export default {
  isOwner:function(req,res){
    if(req.user){
      return true;
    } else {
      return false;
    }
  },
  statusUI:function(req,res){
    let authStatusUI = '<a href="/login/google">Google</a> | <a href="/login/naver">Naver</a> | <a href="/login/kakao">Kakao</a>'
    if(this.isOwner(req, res)){
      authStatusUI = `${req.user.displayName} | <a href="/login/logout">logout</a>`;
    }
    return authStatusUI;
  }
};
