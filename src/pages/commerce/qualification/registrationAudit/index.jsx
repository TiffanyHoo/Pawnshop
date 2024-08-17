import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Button, Popconfirm, Form, Drawer, Col, Row, Select, DatePicker, Space, Tooltip, notification } from 'antd'
import moment from 'moment'
import axios from 'axios'
import Qs from 'qs'
import store from '../../../../redux/store'
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { SmileOutlined,WarningOutlined } from '@ant-design/icons';

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

export default class registrationAudit extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '操作',
        dataIndex: 'operation',
        width: '120px',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              <Popconfirm title="确认通过审核?" onConfirm={() => this.handlePass(record)}>
                <a>通过</a>
              </Popconfirm>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Popconfirm title="确认不通过审核?" onConfirm={() => this.handleNotPass(record)}>
                <a>不通过</a>
              </Popconfirm>
            </div>     
          ) : null,
      },
      {
        title: '当行编号',
        dataIndex: 'PSID',
        key: 'PSID',
        editable: false,
        width: '120px'
      },
      {
        title: '当行名称',
        dataIndex: 'PSName',
        key: 'PSName'
      },
      {
        title: '注册资本',
        dataIndex: 'RegCapital',
        key: 'RegCapital',
        width: '120px'
      },
      {
        title: '成立时间',
        dataIndex: 'FoundDate',
        key: 'FoundDate'
      },
      {
        title: '地址',
        dataIndex: 'Address',
        key: 'Address',
        ellipsis: {
          showTitle: false,
        },
        render: Address => (
          <Tooltip placement="topLeft" title={Address}>
            {Address}
          </Tooltip>
        ),
      },
      {
        title: '联系电话',
        dataIndex: 'Phone',
        key: 'Phone'
      },
      {
        title: '法定代表人',
        dataIndex: 'PSstaffName',
        key: 'PSstaffName',
        width: '120px'
      },
    ];

    this.state = {
      visible: false ,
      dataSource: [],
      count: 0,
      PSID: '',
      PSName: '',
      Address: '',
      RegCapital: '',
      FoundDate: '',
      BusinessTerm: '',
      Representative: '',
      PSstaffName: '',
      Identification: '',
      PermitCode: '',
      PermitAuthority: '',
      PermitDate: '',
      BLicenseAuthority: '',
      SocCreCode: '',
      Phone: '',
      Zip: '',
      Description: '',
      IsBranch: '',
      HeadOfficeID: '',
      AuditState: '',
      ComMemID: ''
    };
  }

  formRef = React.createRef()

  componentDidMount(){
    this.getData()
  }

  getData = async () => {
    let dataSource = []
    await axios.get('/getPawnshop',{
      params:{
        AuditState: 0
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

    dataSource = dataSource?dataSource.map((obj,index) => {
      return {
        ...obj,
        key: index
      };
    }):[];

    this.setState({
      dataSource,
      count: dataSource.length
    })
  }

  handlePass = async (record) => {
    const dataSource = [...this.state.dataSource];
    // const {PSID}=dataSource.find((item) => item.key == record.key)
    const {PSID} = record;
    const {ComMemID} = store.getState()

    let data = {
      PSID,
      ComMemID,
      AuditState: 1,
      operation: 'registerAudit'
    }

    axios({
      method: 'post',
      url: 'http://localhost:3000/modPawnshop',
      data: Qs.stringify(data)
    }).then(response=>{
      notification.open({
        message: 'Notification',
        description:
          <div style={{whiteSpace: 'pre-wrap'}}>{PSID}典当行注册审核已通过</div>,
        icon: <SmileOutlined style={{color:'orange'}}/>,
        duration: 2
      });
    }).catch(error=>{
      console.log(error);
    });

    this.setState({
      dataSource: dataSource.filter((item) => item.key !== record.key)
    });
  };

  handleNotPass = (record) => {
    const dataSource = [...this.state.dataSource];
    // const {PSID}=dataSource.find((item) => item.key == record.key)
    const {PSID} = record;
    const {ComMemID} = store.getState()

    let data = {
      PSID,
      ComMemID,
      AuditState: 2,
      operation: 'registerAudit'
    }

    axios({
      method: 'post',
      url: 'http://localhost:3000/modPawnshop',
      data: Qs.stringify(data)
    }).then(response=>{
      notification.open({
        message: 'Notification',
        description:
        <div style={{whiteSpace: 'pre-wrap'}}>{PSID}典当行注册审核未通过<br/>其使用权限未开启</div>,
        icon: <WarningOutlined style={{color:'orange'}}/>,
        duration: 2
      });
    }).catch(error=>{
      console.log(error);
    });

    this.setState({
      dataSource: dataSource.filter((item) => item.key !== record.key),
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

  showDrawer = () => {
    this.setState({
      visible: true
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { dataSource,PSID,PSName,Address,PSstaffName,Identification,RegCapital,FoundDate,BusinessTerm,Representative,PermitCode,PermitAuthority,PermitDate,BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID,AuditState,ComMemID } = this.state;
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
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>资质管理</Breadcrumb.Item>
          <Breadcrumb.Item>注册审核</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Table
            size='small'
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 10 }}
            onRow={record => {
              return {
                onDoubleClick: event => {
                  const { PSID,PSName,Address,RegCapital,FoundDate,BusinessTerm,Representative,PSstaffName,Identification,PermitCode,PermitAuthority,PermitDate,BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID,AuditState,ComMemID } = record
                  this.setState({
                    PSID,PSName,Address,RegCapital,FoundDate,BusinessTerm,Representative,PSstaffName,Identification,PermitCode,PermitAuthority,PermitDate,BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID,AuditState,ComMemID,
                    visible: true
                  });
                  setTimeout(() => {
                    this.formRef.current.setFieldsValue({
                      PSID,PSName,Address,RegCapital,FoundDate:moment(FoundDate),BusinessTerm,Representative,PSstaffName,Identification,PermitCode,PermitAuthority,PermitDate:moment(PermitDate),BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID,AuditState,ComMemID
                    })
                  }, 100); 
                },
              };
            }}
          />
        </div>

        <Drawer
          title="当行信息详情"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
        >
          <Form layout="vertical" ref={this.formRef} hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PSID"
                  label="当行编号"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PSName"
                  label="当行名称"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Address"
                  label="详细地址"
                >
                  <Input.TextArea rows={3} disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="IsBranch"
                  label="是否为分行"
                >
                  <Select value={this.state.IsBranch} disabled>
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="HeadOfficeID"
                  label="所属总行"
                >
                  <Select value={this.state.HeadOfficeID} disabled>
                    <Option value="PS001">中富达典当行</Option>
                    <Option value="PS002">赢创典当行</Option>
                    <Option value="PS003">咸阳典当行</Option>
                    <Option value="PS004">羊城典当行</Option>
                    <Option value="PS005">欧翔典当行</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="FoundDate"
                  label="成立时间"
                >
                  <DatePicker style={{ width: '100%' }} disabled/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="BusinessTerm"
                  label="营业期限"
                  rules={[{ required: true, message: '请输入营业期限' }]}
                >
                  <Input disabled/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PSstaffName"
                  label="法定代表人"
                  rules={[{ required: true, message: '请输入法定代表人' }]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Identification"
                  label="代表人证件号"
                  rules={[{ required: true, message: '请输入代表人证件号' }]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="SocCreCode"
                  label="统一社会信用代码"
                  rules={[{ required: true, message: '请输入统一社会信用代码' }]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="RegCapital"
                  label="注册资本"
                  rules={[{ required: true, message: '请输入注册资本' }]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PermitCode"
                  label="经营许可证编码"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PermitDate"
                  label="许可证发证日期"
                >
                  <DatePicker disabled style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PermitAuthority"
                  label="许可证批准机关"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="BLicenseAuthority"
                  label="营业执照登记机关"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>  
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Phone"
                  label="联系电话"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Zip"
                  label="邮政编码"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Description"
                  label="简介"
                >
                  <Input.TextArea rows={4} disabled/>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>
      </div>
    )
  }
}
