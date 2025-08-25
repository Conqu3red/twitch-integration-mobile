class HydraulicsControllerProxy
{
    constructor(){
        this.m_Phases = []
    }
    
    SerializeBinary(stream)
    {
        stream.WriteInt32(this.m_Phases.length);
        this.m_Phases.forEach(hydraulicsControllerPhaseProxy => {
            hydraulicsControllerPhaseProxy.SerializeBinary(stream);
        })
    }

    
    DeserializeBinary(version, stream)
    {
        let num = stream.ReadInt32()
        console.log("number of phases: " + num)
        this.m_Phases = []
        for (var i = 0; i < num; i++)
        {
            this.m_Phases.push(HydraulicsControllerPhaseProxy.DeserializeBinary(version, stream));
        }
    }
}
