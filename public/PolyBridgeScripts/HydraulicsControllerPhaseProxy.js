class HydraulicsControllerPhaseProxy
{
    constructor(m_HydraulicsPhaseGuid, m_PistonGuids, m_BridgeSplitJoints)
    {
        this.m_HydraulicsPhaseGuid = m_HydraulicsPhaseGuid;
        this.m_PistonGuids = m_PistonGuids || [];
        this.m_BridgeSplitJoints = m_BridgeSplitJoints || [];
    }


    
    SerializeBinary(stream)
    {
        stream.WriteString(this.m_HydraulicsPhaseGuid);
        this.SerializePistonGuids(stream);
        stream.WriteInt32(this.m_BridgeSplitJoints.length);
        this.m_BridgeSplitJoints.forEach(bridgeSplitJointProxy => {
            bridgeSplitJointProxy.SerializeBinary(stream);
        })
    }


    static DeserializeBinary(version, stream)
    {
        let ret = new HydraulicsControllerPhaseProxy()
        ret.m_HydraulicsPhaseGuid = stream.ReadString()
        ret.DeserializePistonGuids(stream);
        if (version > 2)
        {
            let num = stream.ReadInt32()
            for (var i = 0; i < num; i++)
            {
                ret.m_BridgeSplitJoints.push(BridgeSplitJointProxy.DeserializeBinary(stream));
            }
            return ret;
        }
        let num2 = stream.ReadInt32()
        for (var j = 0; j < num2; j++)
        {
            stream.ReadString()
        }
    }

    SerializePistonGuids(stream)
    {
       stream.WriteInt32(this.m_PistonGuids.length);
        this.m_PistonGuids.forEach(s => {
            stream.WriteString(s);
        })
    }

    DeserializePistonGuids(stream)
    {
        let num = stream.ReadInt32()
        for (var i = 0; i < num; i++)
        {
            this.m_PistonGuids.push(stream.ReadString());
        }
    }
}
