import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Button, Form, Drawer, Image, Select, DatePicker, Space, Badge, notification } from 'antd'
import axios from 'axios'
import Qs from 'qs'
import store from '../../../../redux/store'
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { QuestionCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SmileOutlined } from '@ant-design/icons';

const { Option } = Select;

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


export default class Orders extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        width: '10%',
        filters: [
          {text: '已接单',value: '1'},
          {text: '已完成',value: '2'},
          {text: '已拒单',value: '3'},
          {text: '未接单',value: '0'},
        ],
        render: (_, record) =>
          record.state === "1" ? (
              <Badge color="orange" text="已接单" />
          ) : record.state === "2" ? (
              <Badge color="green" text="已完成" />
          ) : record.state === "0" ? (
              <Badge color="volcano" text="已拒单" />
          ) : <Badge color="blue" text="未接单" />
        },
      {
        title: '当物编号',
        dataIndex: 'PIID',
        key: 'PIID',
        editable: false
      },
      {
        title: '类目',
        dataIndex: 'title',
        key: 'title'
      },
      {
        title: '当行名称',
        dataIndex: 'PSName',
        key: 'PSName'
      },
      {
        title: '联系电话',
        dataIndex: 'PSPhone',
        key: 'PSPhone'
      },
      {
        title: '鉴定服务',
        dataIndex: 'Authenticate',
        key: 'Authenticate',
        render: (_, record) =>
          record.Authenticate === "0" ? (
            <span>否</span>
          ) : (
            <span>是</span>
          ) 
      },
      {
        title: '估价服务',
        dataIndex: 'Assess',
        key: 'Assess',
        render: (_, record) =>
          record.Assess === "1" ? (
            <span>是</span>
          ) : (
            <span>否</span>
          ) 
      },
      {
        title: '鉴定服务费',
        dataIndex: 'AuthenticateFare',
        key: 'AuthenticateFare'
      },
      {
        title: '估价服务费',
        dataIndex: 'AssessFare',
        key: 'AssessFare'
      },
    ];

    this.state = {
      ImageVisible: false,
      images:['http://localhost:8080/filepath/item/gold1.png'],
      visible: false ,
      dataSource: [],
      count: 0,
      PIID: '',
      title: '',
      SpeDetail: '',
      DocDetail: '',
      Specification: '',
      Documents: '',
      photopath: '',
      Files: '',
      canDistribute: '',
      PSID: '',
      Delivery: '',
      DeliveryTo: '',
      DeliveryBack: '',
      Authenticate: '',
      AuthenRes: '',
      AuthenticateFare: '',
      Assess: '',
      AssessRes: '',
      AssessFare: '',
      state: '',
      Notes: '',
      title:'',Specification:'',Documents:'',Discript:''
    };
  }

  componentDidMount(){
    this.getData()
  }

  getData = async () => {
    let dataSource = []
    console.log(store.getState().ExpertID)
    await axios.get('/getExpSer',{
      params:{
        type:'getAllSer',
        ExpertID:store.getState().ExpertID
      }
    }).then(response=>{
        if(response.data.length === 0){
          console.log('无数据')
        }else{
          dataSource = response.data
          console.log(dataSource)
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

  handleAccept = async (record) => {
    var that = this;

    let data = {
      PIID: record.PIID,
      PSID: record.PSID,
      ExpertID:store.getState().ExpertID,
      type: 'Accept'
    }

    axios({
      method: 'post',
      url: 'http://localhost:3000/modExpSer',
      data: Qs.stringify(data)
    }).then(response=>{
      notification.open({
        message: '消息',
        description:
          <div style={{whiteSpace: 'pre-wrap'}}>
            已成功接单
          </div>,
        icon: <SmileOutlined style={{color:'orange'}}/>,
        duration: 2
      });
      that.getData();
    }).catch(error=>{
      console.log(error);
    });
  }

  handleReject = async (record) => {
    var that= this;

    let data = {
      PIID: record.PIID,
      PSID: record.PSID,
      ExpertID:store.getState().ExpertID,
      type: 'Reject'
    }

    axios({
      method: 'post',
      url: 'http://localhost:3000/modExpSer',
      data: Qs.stringify(data)
    }).then(response=>{
      notification.open({
        message: '消息',
        description:
          <div style={{whiteSpace: 'pre-wrap'}}>
            已成功拒单
          </div>,
        icon: <SmileOutlined style={{color:'orange'}}/>,
        duration: 2
      });
      that.getData();
    }).catch(error=>{
      console.log(error);
    });
  }

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  onSubmit = async () => {
    console.log(this.state)

    await axios.post('/addComMem',{
      ComMemID: this.state.ComMemID,
      ComMemName: this.state.ComMemName,
      Gender: this.state.Gender,
      BirthDate: this.state.BirthDate,
      Address: this.state.Address,
      Phone: this.state.Phone,
      Email: this.state.Email,
      Notes: this.state.Notes
    }).then(response=>{
      console.log(response);
    }).catch(error=>{
        console.log(error);
    });



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
    const { dataSource,title,Specification,Documents,Discript,images,ImageVisible } = this.state;
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
          title: col.title
        }),
      };
    });

    return (
      <div>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>鉴定估价</Breadcrumb.Item>
          <Breadcrumb.Item>服务单管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
            onRow={record => {
              return {
                  onDoubleClick: event => {
                      const { title,Specification,Documents,Discript,photopath } = record
                      console.log(record)
                      console.log(photopath.split(";"))
                      this.setState({
                        visible:true,title,Specification,Documents,Discript,
                        images:photopath.split(";")
                      });
                      //console.log(TID)
                  },
              };
            }}
          />
        </div>

        <Drawer
          title="物品详情"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
        >
          <Input.TextArea rows={3} onChange={this.handleAddress} placeholder="请输入评估结果" />
        </Drawer>
      </div>
    )
  }
}
