class BridgeJointProxy
{
    constructor(Pos, IsAnchor, IsSplit, Guid)
    {
        this.m_Pos = Pos;
        this.m_IsAnchor = IsAnchor;
        this.m_IsSplit = IsSplit;
        this.m_Guid = Guid;
    }

    SerializeBinary(stream)
    {
        stream.WriteVector3(this.m_Pos)
        stream.WriteBool(this.m_IsAnchor);
        stream.WriteBool(this.m_IsSplit);
        stream.WriteString(this.m_Guid);
    }

    // Token: 0x0600039D RID: 925 RVA: 0x00017577 File Offset: 0x00015777
    static DeserializeBinary(version, stream)
    {
        let ret = new BridgeJointProxy()
        ret.m_Pos = stream.ReadVector3()
        ret.m_IsAnchor = stream.ReadBool()
        ret.m_IsSplit = stream.ReadBool()
        ret.m_Guid = stream.ReadString()
        return ret
    }
}