class BridgeSpringProxy
{
    constructor(m_NormalizedValue, m_NodeA_Guid, m_NodeB_Guid, m_Guid)
    {
        this.m_NormalizedValue = m_NormalizedValue;
        this.m_NodeA_Guid = m_NodeA_Guid;
        this.m_NodeB_Guid = m_NodeB_Guid;
        this.m_Guid = m_Guid;
    }
    SerializeBinary(stream)
    {
        stream.WriteFloat(this.m_NormalizedValue);
        stream.WriteString(this.m_NodeA_Guid);
        stream.WriteString(this.m_NodeB_Guid);
        stream.WriteString(this.m_Guid);
    }

    // Token: 0x0600044A RID: 1098 RVA: 0x0001B62F File Offset: 0x0001982F
    static DeserializeBinary(stream)
    {
        let ret = new BridgeSpringProxy()
        ret.m_NormalizedValue = stream.ReadFloat()
        ret.m_NodeA_Guid = stream.ReadString()
        ret.m_NodeB_Guid = stream.ReadString()
        ret.m_Guid = stream.ReadString()
        return ret
    }
}
