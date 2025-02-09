import Alert from "../../models/alert.models.js";

const getAlert = async (req,resp) =>{
    try{     
        let alert = await Alert.find();
        if(!alert)
        {
          return resp.status(404).json({message:"No message found"});
        }

        return resp.status(201).json({alert});
  }
  catch(err)
  {
      console.log(err);
      return resp.status(401).json({ message: "Error occured" });        
  }
}

export default getAlert