class BridgeSplitJointProxy
{
    constructor(m_BridgeJointGuid, m_SplitJointState)
    {
        this.m_BridgeJointGuid = m_BridgeJointGuid;
        this.m_SplitJointState = m_SplitJointState;
    }
    
    SerializeBinary(stream)
    {
        stream.WriteString(this.m_BridgeJointGuid);
        stream.WriteInt32(this.m_SplitJointState);
    }

    static DeserializeBinary(stream)
    {
        let ret = new BridgeSplitJointProxy()
        ret.m_BridgeJointGuid = stream.ReadString()
        ret.m_SplitJointState = stream.ReadInt32()
        return ret
    }

    //public enum SplitJointState
    //{
    //    // Token: 0x040002F7 RID: 759
    //    ALL_SPLIT,
    //    // Token: 0x040002F8 RID: 760
    //    NONE_SPLIT,
    //    // Token: 0x040002F9 RID: 761
    //    A_SPLIT_ONLY,
    //    // Token: 0x040002FA RID: 762
    //    B_SPLIT_ONLY,
    //    // Token: 0x040002FB RID: 763
    //    C_SPLIT_ONLY
    //}
}
