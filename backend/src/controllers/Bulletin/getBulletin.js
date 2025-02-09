import { Bulletin } from "../../models/bulletin.models.js";


const getBulletin = async (req, res) => {
    try {
        
        let bulletin = await Bulletin.find();
        if(!bulletin)
        {
          return res.status(404).json({message:"No message found"});
        }
    
        return res.status(201).json({ message: "Bulletin created successfully.", bulletin });
    } catch (error) {
        console.error('Error creating bulletin:', error);
        return res.status(500).json({ message: "Error creating bulletin.", error: error.message });
    }
}

export default getBulletin