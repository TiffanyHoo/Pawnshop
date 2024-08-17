import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Button, Switch, Form, Drawer, Select, Space, Tooltip, notification, Tag, Upload, Modal, message } from 'antd'
import axios from 'axios'
import Qs from 'qs'
import store from '../../../../redux/store'
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { PlusOutlined, SmileOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { CheckableTag } = Tag;

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const normFile = (e) => {
  console.log('Upload event:', e);

  if (Array.isArray(e)) {
    return e;
  }

  return e && e.fileList;
};

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export default class ManageGoods extends Component {
  constructor(props) {
    super(props);

    //PIID,title,SpeDetail,DocDetail,Specification,Documents,photopath,UnitPrice,Quantity,PriceOnSale,canDistribute,state
    this.columns = [
      {
        title: '当品编号',
        dataIndex: 'PIID',
        key: 'PIID',
        editable: false,
        width: '150px',
        fixed: 'left'
      },
      {
        title: '当物名称',
        dataIndex: 'itemName',
        key: 'itemName',
        width: '120px',
        fixed: 'left'
      },
      {
        title: '当物类别',
        dataIndex: 'title',
        key: 'title',
        width: '120px',
        fixed: 'left'
      },
      {
        title: '当价',
        dataIndex: 'UnitPrice',
        key: 'UnitPrice',
        width: '120px'
      },
      {
        title: '数量',
        dataIndex: 'Quantity',
        key: 'Quantity',
        width: '100px'
      },
      {
        title: '售价',
        dataIndex: 'PriceOnSale',
        key: 'PriceOnSale',
        width: '120px'
      },
      {
        title: '上架操作',
        dataIndex: 'operation',
        width: '100px',
        fixed:'right',
        render: (_, record) =>
          record.state === '4' ? (
            <p>已售出</p>
          ):
          record.state === '3' ? (
            <Switch defaultChecked onChange={(e)=>{this.changeState(e,record.PIID)}} />
          ) : record.PriceOnSale === undefined || record.PriceOnSale.trim() === '' ? (
            <Tooltip placement="top" title="请先设置售价">
              <Switch disabled />
            </Tooltip>
          ) : (
            <Switch onChange={(e)=>{this.changeState(e,record.PIID)}} />
          ),
      },
    ];

    this.state = {
      previewVisible: false,
      visible: false ,
      SpeDetailArr: [],
      DocDetailArr: [],
      SpecificationArr: [],
      SpecificationData: {},
      DocumentsArr: [],
      selectedTags: [],
      dataSource: [],
      count: 0,
      PIID: '',
      title: '',
      SpeDetail: '',
      DocDetail: '',
      PSID: '',
      Specification: '',
      Documents: '',
      photopath: '',
      UnitPrice: '',
      Quantity: '',
      PriceOnSale: '',
      canDistribute: '',
      state: '',
      Discript: '',
      fileList:[],
      previewTitle:''
    };
  }

  formRef = React.createRef();

  componentDidMount(){
    this.getData()
  }

  getData = async () => {
    const {PSID} = store.getState()
    let dataSource = []
    await axios.get('/getGoods',{
      params:{
        id: PSID
      }
    }).then(response=>{
      if(response.data.length === 0){
        console.log('无数据')
      }else{
        dataSource = response.data
      }
    }).catch(error=>{
        console.log(error);
    });

    dataSource = dataSource.map((obj,index) => {
      return {
        ...obj,
        key: index
      };
    });

    this.setState({
      dataSource,
      count: dataSource.length
    })
  }

  changeState = (e,PIID) => {
    let data = {
      type:'changeState',
      state:e?3:2,
      PIID
    }

    axios({
      method: 'post',
      url: 'http://localhost:3000/modGoods',
      data: Qs.stringify(data)
    }).then(response=>{
      notification.open({
        message: '提示',
        description:
          <div style={{whiteSpace: 'pre-wrap'}}>已成功{e?'上架':'下架'}</div>,
        icon: <SmileOutlined style={{color:'orange'}}/>,
        duration: 2
      });
    });
  }

  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
    });
  };
  handleSave = (row) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    this.setState({
      dataSource: newData,
    });
  };

  handleID = (e) =>{
    this.setState({
      ComMemID: e.target.value
    })
  }

  handleName = (e) =>{
    this.setState({
      ComMemName: e.target.value
    })
  }

  handleDate = (date, dateString) =>{
    this.setState({
      BirthDate: dateString
    })
  }

  handleNotes = (e) =>{
    this.setState({
      Notes: e.target.value
    })
  }

  showDrawer = (record) => {
    const {SpeDetail,DocDetail,Specification,Documents,photopath} = record
    let selectedTags = [];

    const SpeDetailArr = SpeDetail.split(";")
    const SpecificationArr = Specification.split(";")
    let SpecificationData = {}
    SpeDetailArr.map((obj)=>{
      SpecificationArr.map((obj1)=>{
        obj1 = obj1.split(":")
        if(obj1[0] === obj){
          SpecificationData[obj] = obj1[1]
        }
      });
    })
    // console.log(SpecificationData)
    const DocDetailArr = DocDetail.split(";")
    const DocumentsArr = Documents.split(";")
    selectedTags = DocumentsArr
    // console.log(selectedTags)

    let fileList=photopath.split(";")
    fileList=fileList.map((obj,index) => {
      return {
          url: obj,
          uid: index,
          key: index
      };
    });
    this.setState({
      ...record,SpeDetailArr,DocDetailArr,SpecificationArr,DocumentsArr,SpecificationData,selectedTags,
      fileList
    })
    console.log(photopath.split(";"))
    this.setState({
      visible: true
    });

    setTimeout(() => {
      this.formRef.current.setFieldsValue({
        ...record,canDistribute:record.canDistribute==='0'?'否':'是'
      })
    }, 200);
  };

  handleTagsChange(tag, checked) {
    const { selectedTags } = this.state;
    const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
    this.setState({ selectedTags: nextSelectedTags });
  }

  onClose = () => {
    this.setState({
      visible: false,
      PIID: '',
      title: '',
      SpeDetail: '',
      DocDetail: '',
      PSID: '',
      Specification: '',
      Documents: '',
      photopath: '',
      UnitPrice: '',
      Quantity: '',
      PriceOnSale: '',
      canDistribute: '',
      state: '',
      Discript: ''
    });
  };

  onSubmit = async () => {
    const {PIID,PriceOnSale} = this.state

    let data = {
      type: 'onsale',
      PIID,PriceOnSale
    }

    await axios({
      method: 'post',
      url: 'http://localhost:3000/modUserItem',
      data: Qs.stringify(data)
    }).then(response=>{
      notification.open({
        message: '提示',
        description:
          <div style={{whiteSpace: 'pre-wrap'}}>已成功修改售价</div>,
        icon: <SmileOutlined style={{color:'orange'}}/>,
        duration: 2
      });
    });

    this.getData()
    this.onClose();
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  handleImgChange = ({ file, fileList }) => {
    if (file.status === 'done') { 
      const newList = fileList.map((v)=>{
        if(v.uid===file.uid){
          v.url='http://localhost:8080/filepath/item/'+file.response.targetfile
        }
        return v
      })
      this.setState({
        photopath: newList[0].url
      })
      message.success('上传图片成功')
    } else if (file.status === 'removed') { 
        // const result = await reqDeleteImg(file.name)
        message.success('删除图片成功！')
    }else if (file.status === 'error') { 
        message.error('图片编辑失败！')
    }else{

    }
    this.setState({ fileList })
  }

  render() {
    const { previewVisible,previewImage,previewTitle,fileList,dataSource,SpeDetailArr,SpecificationArr,DocDetailArr,SpecificationData,selectedTags,PIID,title,photopath,Unitprice,Quantity,PriceOnSale,canDistribute,state,Discript } = this.state;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    const uploadButton = (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    );

    return (
      <div>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>当物商城</Breadcrumb.Item>
          <Breadcrumb.Item>绝当品管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Table
            size="small"
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender: record => <p style={{ margin: 0 }}>规格详情: {record.Specification}<br/>附件: {record.Documents}</p>,
              rowExpandable: record => record.Specification !== '' || record.Documents !== '',
            }}
            onRow={record => {
              return {
                onDoubleClick: event => {
                  this.showDrawer(record)       
                },
              };
            }}
          />
        </div>

        <Drawer
          title="编辑当品信息"
          width={320}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
          extra={
            <Space>
              {/* <Button onClick={this.onClose}>取消</Button> */}
              <Button onClick={this.onSubmit} type="primary">
                确定
              </Button>
            </Space>
          }
        >
          <Form layout="horizontal" ref={this.formRef} hideRequiredMark
          initialValues={{PIID,title,Discript,Quantity,Unitprice,canDistribute,...SpecificationData,Documents:selectedTags}}
          >
            <Form.Item
              name="PIID"
              label="编号"
              rules={[{ required: true, message: '请输入当品编号' }]}
            >
              <Input value={PIID} placeholder="请输入当品编号" onChange={this.handleID} />
            </Form.Item>
            <Form.Item
              name="title"
              label="类别"
            >
              <Input value={title}  onChange={this.handletitle} />
            </Form.Item>
            <Form.Item
              name="Quantity"
              label="单位"
            >
              <Input value={Quantity} onChange={this.handleQuantity} />
            </Form.Item>
            <Form.Item
              name="PriceOnSale"
              label="售价"
            >
              <Input value={PriceOnSale} onChange={(e)=>this.setState({PriceOnSale:e.target.value})} />
            </Form.Item>
            <Form.Item
              name="canDistribute"
              label="配送"
            >
              <Input value={canDistribute} onChange={this.handleCanDistribute} />
            </Form.Item>
            {
              SpeDetailArr.map((obj,index)=>{
                let value = ''
                SpecificationArr.map((obj1)=>{
                  obj1 = obj1.split(":")
                  if(obj1[0] === obj){
                    value=obj1[1]
                  }
                });
                return (
                  <Form.Item
                    name={obj}
                    label={obj}
                    rules={[{ required: true, message: '请输入'+obj }]}
                    value={value}
                  >
                    <Input value={value} placeholder={"请输入"+obj} onChange={this.handlePIID} />
                  </Form.Item>
                );
              })
            }
            <Form.Item
              name="Documents"
              label="附件"
              rules={[{ required: true, message: '请选择可提供附件' }]}
            >
              <div>
              {
              DocDetailArr.map((obj,index)=>{
                return (
                    <CheckableTag
                      key={obj}
                      checked={selectedTags.indexOf(obj) > -1}
                      onChange={checked => this.handleTagsChange(obj, checked)}
                    >
                      {obj}
                    </CheckableTag>
                )
              })        
              }
              </div>            
            </Form.Item>
            <Form.Item
                label="照片"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  action="http://localhost:3000/upload?type=item"
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={this.handlePreview}
                  onChange={this.handleImgChange}
                >
                  {fileList.length >= 9 ? null : uploadButton}
                </Upload>
                <Modal
                  visible={previewVisible}
                  title={previewTitle}
                  footer={null}
                  onCancel={this.handleCancel}
                >
                  <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </Form.Item>
            <Form.Item
              name="Discript"
              label="简介"
              rules={[
                {
                  required: true,
                  message: '请输入简介',
                },
              ]}
            >
              <Input.TextArea rows={3} value={Discript} onChange={this.handleDiscript} placeholder="请输入简介" />
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    )
  }
}
