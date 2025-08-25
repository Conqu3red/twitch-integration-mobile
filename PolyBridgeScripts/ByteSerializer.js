class BinaryStream {
    constructor(){
        this.base_stream = []
        this.offset = 0
    }
    get stream(){
        return new Uint8Array(this.base_stream)
    }
    // read
    ReadByte(){
        let ret = this.base_stream.slice(this.offset, this.offset+1)[0]
        this.offset += 1
        return ret
    }
    ReadBytes(length){
        let ret = this.base_stream.slice(this.offset, this.offset+length)
        this.offset += length
        return ret
    }
    ReadByteArray(){
        let num = this.ReadInt32()
        if (num > 0){
            return this.ReadBytes(num)
        }
        return null
    }

    ReadUInt8(){
        let arr = new Uint8Array(this.base_stream).buffer
        let view = new DataView(arr);
        let ret = view.getUint8(this.offset, true)
        this.offset += 1
        return ret
    }
    ReadInt8(){
        let arr = new Uint8Array(this.base_stream).buffer
        let view = new DataView(arr);
        let ret = view.getInt8(this.offset, true)
        this.offset += 1
        return ret
    }
    ReadUInt16(){
        let arr = new Uint8Array(this.base_stream).buffer
        let view = new DataView(arr);
        let ret = view.getUint16(this.offset, true)
        this.offset += 2
        return ret
    }
    ReadInt16(){
        let arr = new Uint8Array(this.base_stream).buffer
        let view = new DataView(arr);
        let ret = view.getInt16(this.offset, true)
        this.offset += 2
        return ret
    }
    ReadUInt32(){
        let arr = new Uint8Array(this.base_stream).buffer
        let view = new DataView(arr);
        let ret = view.getUint32(this.offset, true)
        this.offset += 4
        return ret
    }
    ReadInt32(){
        let arr = new Uint8Array(this.base_stream).buffer
        let view = new DataView(arr);
        let ret = view.getInt32(this.offset, true)
        this.offset += 4
        return ret
    }
    ReadFloat(){
        let arr = new Uint8Array(this.base_stream).buffer
        let view = new DataView(arr);
        let ret = view.getFloat32(this.offset, true)
        this.offset += 4
        return ret
    }
    ReadDouble(){
        let arr = new Uint8Array(this.base_stream).buffer
        let view = new DataView(arr);
        let ret = view.getFloat64(this.offset, true)
        this.offset += 8
        return ret
    }
    ReadBool(){
        let ret = this.ReadUInt8()
        return ret == 1 ? true : false
    }
    ReadVector2(){
        let ret = new Vector()
        ret.x = this.ReadFloat()
        ret.y = this.ReadFloat()
        return ret
    }
    ReadVector3(){
        let ret = new Vector()
        ret.x = this.ReadFloat()
        ret.y = this.ReadFloat()
        ret.z = this.ReadFloat()
        return ret
    }
    ReadQuaternion(){
        let ret = new Vector()
        ret.x = this.ReadFloat()
        ret.y = this.ReadFloat()
        ret.z = this.ReadFloat()
        ret.w = this.ReadFloat()
        return ret
    }
    ReadString(useInt=false){
        let num = 0;
        if (useInt){
            num = this.ReadInt32()
        }
        else {
            num = this.ReadUInt16()
        }
        if (num > 0){
            let string = new TextDecoder("utf-8").decode(this.stream.slice(this.offset, this.offset+num))
            this.offset += num
            return string
        }
        return ""
    }




    // write
    WriteByte(value){
        this.base_stream.push(...new Uint8Array([value]))
    }
    WriteBytes(value){
        this.base_stream.push(...new Uint8Array(value))
    }
    WriteByteArray(value){
        this.WriteInt32(value.length)
        if (value.length > 0){
            this.WriteBytes(value)
        }
    }
    WriteUInt8(value){
        let arr = new ArrayBuffer(1)
        let view = new DataView(arr);
        view.setUint8(0, value, true)
        this.base_stream.push(...new Uint8Array(arr))
    }
    WriteInt8(value){
        let arr = new ArrayBuffer(1)
        let view = new DataView(arr);
        view.setInt8(0, value, true)
        this.base_stream.push(...new Uint8Array(arr))
    }
    WriteUInt16(value){
        let arr = new ArrayBuffer(2)
        let view = new DataView(arr);
        view.setUint16(0, value, true)
        this.base_stream.push(...new Uint8Array(arr))
    }
    WriteInt16(value){
        let arr = new ArrayBuffer(2)
        let view = new DataView(arr);
        view.setInt16(0, value, true)
        this.base_stream.push(...new Uint8Array(arr))
    }
    WriteUInt32(value){
        let arr = new ArrayBuffer(4)
        let view = new DataView(arr);
        view.setUint32(0, value, true)
        this.base_stream.push(...new Uint8Array(arr))
    }
    WriteInt32(value){
        let arr = new ArrayBuffer(4)
        let view = new DataView(arr);
        view.setInt32(0, value, true)
        this.base_stream.push(...new Uint8Array(arr))
    }
    WriteFloat(value){
        let arr = new ArrayBuffer(4)
        let view = new DataView(arr);
        view.setFloat32(0, value, true)
        this.base_stream.push(...new Uint8Array(arr))
    }
    WriteDouble(value){
        let arr = new ArrayBuffer(8)
        let view = new DataView(arr);
        view.setFloat64(0, value, true)
        this.base_stream.push(...new Uint8Array(arr))
    }
    WriteBool(value){
        let arr = new ArrayBuffer(1)
        let view = new DataView(arr);
        view.setUint8(0, value == true ? 1 : 0, true)
        this.base_stream.push(...new Uint8Array(arr))
    }
    WriteVector2(value){
        this.WriteFloat(value.x)
        this.WriteFloat(value.y)
    }
    WriteVector3(value){
        this.WriteFloat(value.x)
        this.WriteFloat(value.y)
        this.WriteFloat(value.z)
    }
    WriteQuaternion(value){
        this.WriteFloat(value.x)
        this.WriteFloat(value.y)
        this.WriteFloat(value.z)
        this.WriteFloat(value.w)
    }
    WriteString(value, useInt=false){
        let num = value.length;
        if (useInt){
            this.WriteInt32(num)
        }
        else {
            this.WriteUInt16(num)
        }
        if (num > 0){
            this.WriteBytes(new TextEncoder("utf-8").encode(value))
        }
    }
}

