class BridgeEdgeProxy
{
    constructor(m_Material, m_NodeA_Guid, m_NodeB_Guid, m_JointAPart, m_JointBPart)
    {
        this.m_Material = m_Material;
        this.m_NodeA_Guid = m_NodeA_Guid;
        this.m_NodeB_Guid = m_NodeB_Guid;
        this.m_JointAPart = m_JointAPart;
        this.m_JointBPart = m_JointBPart;
    }

    SerializeBinary(stream)
    {
        stream.WriteInt32(this.m_Material)
        stream.WriteString(this.m_NodeA_Guid)
        stream.WriteString(this.m_NodeB_Guid)
        stream.WriteInt32(this.m_JointAPart)
        stream.WriteInt32(this.m_JointBPart)
    }

    static DeserializeBinary(stream)
    {
        let ret = new BridgeEdgeProxy()
        ret.m_Material = stream.ReadInt32()
        ret.m_NodeA_Guid = stream.ReadString()
        ret.m_NodeB_Guid = stream.ReadString()
        ret.m_JointAPart = stream.ReadInt32()
        ret.m_JointBPart = stream.ReadInt32()
        return ret
    }
}
