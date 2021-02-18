class BridgeSaveData
{
    constructor()
    {
        this.m_Version = 9;
        this.m_BridgeJoints = []// new List<BridgeJointProxy>();
        this.m_BridgeEdges = []//new List<BridgeEdgeProxy>();
        this.m_BridgeSprings = []//new List<BridgeSpringProxy>();
        this.m_Pistons = []//new List<PistonProxy>();
        this.m_HydraulicsController = new HydraulicsControllerProxy();
        this.m_Anchors = []//new List<BridgeJointProxy>();
    }
    SerializeBinary()
    {
        let ret = new BinaryStream()
        
        ret.WriteInt32(this.m_Version)
        ret.WriteInt32(this.m_BridgeJoints.length);
        this.m_BridgeJoints.forEach(bridgeJointProxy => {
            bridgeJointProxy.SerializeBinary(ret);
        })
        ret.WriteInt32(this.m_BridgeEdges.length);
        this.m_BridgeEdges.forEach(bridgeEdgeProxy => {
            bridgeEdgeProxy.SerializeBinary(ret);
        })
        ret.WriteInt32(this.m_BridgeSprings.length);
        this.m_BridgeSprings.forEach(bridgeSpringProxy => {
            bridgeSpringProxy.SerializeBinary(ret);
        })
        ret.WriteInt32(this.m_Pistons.length);
        this.m_Pistons.forEach(pistonProxy => {
            pistonProxy.SerializeBinary(ret);
        })
        this.m_HydraulicsController.SerializeBinary(ret);
        ret.WriteInt32(this.m_Anchors.length);
        this.m_Anchors.forEach(bridgeJointProxy2 => {
            bridgeJointProxy2.SerializeBinary(ret);
        })
        return ret.stream
    }

    static DeserializeBinary(/*list*/ bytes)
    {
        let stream = new BinaryStream()
        let ret = new BridgeSaveData()
        stream.base_stream = bytes
        ret.m_Version = stream.ReadInt32()
        console.log("slot version: " + ret.m_Version);
        if (ret.m_Version < 2)
        {
            return ret;
        }
        let num = stream.ReadInt32()
        console.log("number of joints: " + num)
        for (var i = 0; i < num; i++)
        {
            ret.m_BridgeJoints.push(BridgeJointProxy.DeserializeBinary(ret.m_Version, stream ));
        }
        let num2 = stream.ReadInt32()
        console.log("number of edges: " + num)
        for (var j = 0; j < num2; j++)
        {
            ret.m_BridgeEdges.push(BridgeEdgeProxy.DeserializeBinary( stream ));
        }
        if (ret.m_Version >= 7)
        {
            let num3 = stream.ReadInt32()
            console.log("number of springs: " + num3)
            for (var k = 0; k < num3; k++)
            {
                ret.m_BridgeSprings.push(BridgeSpringProxy.DeserializeBinary( stream ));
            }
        }
        let num4 = stream.ReadInt32()
        console.log("number of pistons: " + num4)
        for (var l = 0; l < num4; l++)
        {
            ret.m_Pistons.push(PistonProxy.DeserializeBinary( ret.m_Version, stream ));
        }
        ret.m_HydraulicsController.DeserializeBinary(ret.m_Version, stream);
        if (ret.m_Version == 5)
        {
            let num5 = stream.ReadInt32()
            for (var m = 0; m < num5; m++)
            {
                stream.ReadString()
            }
        }
        if (ret.m_Version >= 6)
        {
            let num6 = stream.ReadInt32()
            for (var n = 0; n < num6; n++)
            {
                ret.m_Anchors.push(BridgeJointProxy.DeserializeBinary(ret.m_Version, stream));
            }
        }
        if (ret.m_Version >= 4 && ret.m_Version < 9)
        {
            stream.ReadBool()
        }
        return ret
    }
}