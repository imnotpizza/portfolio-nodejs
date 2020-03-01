function logcheck(){
/** 
    var isusing=false;
    
    if(req.session.sid==undefined){
      return false;
    }
    
    //console.log(req.session.sid+"  "+req.session.spw);
    if(req.session.sid!=null && req.session.spw!=null){
      isusing=true;
      console.log("@@@session prepared@@@"+isusing);
    }

    return isusing;

    */
   return 1;
}

module.export={
  logcheck : logcheck
}