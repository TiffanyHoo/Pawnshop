import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Button, Switch, Form, Drawer, Col, Row, Select, DatePicker, Space, Tooltip, notification, Tag } from 'antd'
import axios from 'axios'
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
        width: '10%'
      },
      {
        title: '类别',
        dataIndex: 'title',
        key: 'title',
        width: '10%'
      },
      {
        title: '规格详情',
        dataIndex: 'Specification',
        key: 'Specification',
        ellipsis: {
          showTitle: false,
        },
        render: Documents => (
          <Tooltip placement="topLeft" title={Documents}>
            {Documents}
          </Tooltip>
        )
      },
      {
        title: '附件',
        dataIndex: 'Documents',
        key: 'Documents',
        ellipsis: {
          showTitle: false,
        },
        render: Documents => (
          <Tooltip placement="topLeft" title={Documents}>
            {Documents}
          </Tooltip>
        )
      },
      {
        title: '当价',
        dataIndex: 'UnitPrice',
        key: 'UnitPrice',
        width: '10%'
      },
      {
        title: '数量',
        dataIndex: 'Quantity',
        key: 'Quantity',
        width: '10%'
      },
      {
        title: '售价',
        dataIndex: 'PriceOnSale',
        key: 'PriceOnSale',
        width: '10%'
      },
      {
        title: '上架操作',
        dataIndex: 'operation',
        width: '10%',
        render: (_, record) =>
          record.state === '4' ? (
            <p>已售出</p>
          ):
          record.state === '3' ? (
            <Switch defaultChecked onChange={(e)=>{console.log(e)}} />
          ) : record.PriceOnSale === undefined || record.PriceOnSale.trim() === '' ? (
            <Tooltip placement="top" title="请先设置售价">
              <Switch disabled />
            </Tooltip>
          ) : (
            <Switch onChange={(e)=>{console.log(record.PriceOnSale)}} />
          ),
      },
    ];

    this.state = {
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
      Discript: ''
    };
  }

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

  handleAddress = (e) =>{
    this.setState({
      Address: e.target.value
    })
  }

  handlePhone = (e) =>{
    this.setState({
      Phone: e.target.value
    })
  }

  handleNotes = (e) =>{
    this.setState({
      Notes: e.target.value
    })
  }


  showDrawer = (record) => {
    const {SpeDetail,DocDetail,Specification,Documents} = record
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
    console.log(SpecificationData)
    const DocDetailArr = DocDetail.split(";")
    const DocumentsArr = Documents.split(";")
    selectedTags = DocumentsArr
    console.log(selectedTags)
    this.setState({
      ...record,SpeDetailArr,DocDetailArr,SpecificationArr,DocumentsArr,SpecificationData,selectedTags
    })
    this.setState({
      visible: true
    });
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
    console.log(this.state)

    await axios.get('/addComMem',{
      params:{
        ComMemID: this.state.ComMemID,
        ComMemName: this.state.ComMemName,
        Gender: this.state.Gender,
        BirthDate: this.state.BirthDate,
        Address: this.state.Address,
        Phone: this.state.Phone,
        Email: this.state.Email,
        Notes: this.state.Notes
      }
    }).then(response=>{
      console.log(response);
    }).catch(error=>{
        console.log(error);
    });

    this.getData()

    notification.open({
      message: 'Notification',
      description:
        <div style={{whiteSpace: 'pre-wrap'}}>已成功添加人员<br/>初始密码为123456</div>,
      icon: <SmileOutlined style={{color:'orange'}}/>,
      duration: 2
    });
    this.onClose();
  };

  render() {
    const { dataSource,SpeDetailArr,SpecificationArr,DocDetailArr,SpecificationData,selectedTags,PIID,title,photopath,Unitprice,Quantity,PriceOnSale,canDistribute,state,Discript } = this.state;
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

    return (
      <div>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>销售管理</Breadcrumb.Item>
          <Breadcrumb.Item>绝当品管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
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
          title="编辑信息"
          width={320}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
          extra={
            <Space>
              <Button onClick={this.onClose}>Cancel</Button>
              <Button onClick={this.onSubmit} type="primary">
                Submit
              </Button>
            </Space>
          }
        >
          <Form layout="vertical" ref={this.formRef} hideRequiredMark
          initialValues={{PIID,title,Discript,Quantity,Unitprice,canDistribute,...SpecificationData,Documents:selectedTags}}
          >
            <Form.Item
              name="PIID"
              label="当品编号"
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
              name="Unitprice"
              label="售价"
            >
              <Input value={Unitprice} onChange={this.handleUnitprice} />
            </Form.Item>
            <Form.Item
              name="canDistribute"
              label="支持配送"
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
              label="Documents"
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
