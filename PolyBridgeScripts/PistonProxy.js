class PistonProxy
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

    static DeserializeBinary(version, stream)
    {
        let ret = new PistonProxy()
        ret.m_NormalizedValue = stream.ReadFloat()
        ret.m_NodeA_Guid = stream.ReadString()
        ret.m_NodeB_Guid = stream.ReadString()
        ret.m_Guid = stream.ReadString()
        //if (version < 8)
        //{
        //    ret.m_NormalizedValue = PistonProxy.FixupNormalizedValue(this.m_NormalizedValue);
        //}
        return ret
    }
}
