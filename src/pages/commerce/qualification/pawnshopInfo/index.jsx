import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Button, Popconfirm, Form, Drawer, Col, Row, Select, DatePicker, Space, Tooltip, notification } from 'antd'
import moment from 'moment'
import axios from 'axios'
import Qs from 'qs'
import store from '../../../../redux/store'
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { PlusOutlined, SmileOutlined } from '@ant-design/icons';

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


export default class PawnshopInfo extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '当行编号',
        dataIndex: 'PSID',
        key: 'PSID',
        width: '100px',
        editable: false
      },
      {
        title: '当行名称',
        dataIndex: 'PSName',
        key: 'PSName'
      },
      {
        title: '注册资本',
        dataIndex: 'RegCapital',
        key: 'RegCapital'
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
      {
        title: '操作',
        dataIndex: 'operation',
        width: '90px',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm title="确认删除当行吗?" onConfirm={() => this.delMember(record)}>
              <a>删除</a>
            </Popconfirm>
          ) : null,
      }
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
      ComMemID: '',
      DrawerTitle:'新增典当行'
    };
  }

  formRef = React.createRef()

  componentDidMount(){
    this.getData()
  }

  getData = async () => {
    let dataSource = []
    await axios.get('/getPawnshop').then(response=>{
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

  //删除当行
  delMember = (record) => {
    let data = {
      id: record.PSID,
      usertype: 'Pawnshop',
      userid: 'PSID'
    }

    axios({
      method: 'post',
      url: 'http://localhost:3000/delMember',
      data: Qs.stringify(data)
    }).then(response=>{
      if(response.data!==''){
        notification['error']({
          message: '注意',
          description: response.data,
          duration: 2
        });
      }else{
        notification['warning']({
          message: '消息',
          description:
            <p>已删除当行&nbsp;{record.PSID}&nbsp;{record.PSName}</p>,
        });
      }
      this.getData();
    }).catch(error=>{
      console.log(error);
    });
    // setTimeout(() => {
    //   this.getData();
    // }, 1000); 
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
      PSID: e.target.value
    })
  }

  handleName = (e) =>{
    this.setState({
      PSName: e.target.value
    })
  }

  handleAddress = (e) =>{
    this.setState({
      Address: e.target.value
    })
  }

  handleRegCapital = (e) =>{
    this.setState({
      RegCapital: e.target.value
    })
  }

  handlePSstaffName = (e) =>{
    this.setState({
      PSstaffName: e.target.value
    })
  }

  handleRID = (e) =>{
    this.setState({
      Identification: e.target.value
    })
  }

  handleFoundDate = (date, dateString) =>{
    this.setState({
      FoundDate: dateString
    })
  }

  handleBusinessTerm = (e) =>{
    this.setState({
      BusinessTerm: e.target.value
    })
  }

  handlePermitCode = (e) =>{
    this.setState({
      PermitCode: e.target.value
    })
  }

  handlePermitDate = (date, dateString) =>{
    this.setState({
      PermitDate: dateString
    })
  }

  handlePermitAuthority = (e) =>{
    this.setState({
      PermitAuthority: e.target.value
    })
  }

  handleBLicenseAuthority = (e) =>{
    this.setState({
      BLicenseAuthority: e.target.value
    })
  }

  handleSocCreCode = (e) =>{
    this.setState({
      SocCreCode: e.target.value
    })
  }

  handlePhone = (e) =>{
    this.setState({
      Phone: e.target.value
    })
  }

  handleEmail = (e) =>{
    this.setState({
      Email: e.target.value
    })
  }

  handleZip = (e) =>{
    this.setState({
      Zip: e.target.value
    })
  }

  handleIsBranch = (e) =>{
    this.setState({
      IsBranch: e
    })
  }

  handleHeadOfficeID = (e) =>{
    this.setState({
      HeadOfficeID: e
    })
  }

  handleDescription = (e) =>{
    this.setState({
      Description: e.target.value
    })
  }

  showDrawer = () => {
    this.setState({
      PSID: '',
      PSName: '',
      Address: '',
      RegCapital: '',
      FoundDate: '',
      BusinessTerm: '',
      Representative: '',
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
      ComMemID: '',
      DrawerTitle: '新增典当行',
      visible: true
    });

    setTimeout(() => {
      this.formRef.current.resetFields()
      this.formRef.current.setFieldsValue({
        FoundDate: '',
        PermitDate: ''
      })
    }, 200);
  };

  onClose = () => {
    this.setState({
      visible: false
    });
  };

  onSubmit = async () => {
    const { DrawerTitle,PSID,PSName,Address,RegCapital,FoundDate,BusinessTerm,PSstaffName,Identification,PermitCode,PermitAuthority,PermitDate,BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID,AuditState,ComMemID } = this.state
    if(PSID===''||PSName===''||Address===''||RegCapital===''||FoundDate===''||BusinessTerm===''||PSstaffName===''||Identification===''||PermitCode===''||PermitAuthority===''||PermitDate===''||BLicenseAuthority===''||SocCreCode===''||Phone===''||Zip===''||IsBranch===''){
      notification['error']({
        message: '注意',
        description:'有必填字段未填写!',
        duration: 2
      });
      return;
    }

    let data = {
      PSID,PSName,Address,RegCapital,FoundDate,BusinessTerm,PermitCode,PermitAuthority,PermitDate,BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID,
      PSstaffName,Identification,
      Representative:IsBranch==="0"?PSID+'001':HeadOfficeID+'001',
      AuditState:1,InfoChange:0,
      ComMemID:store.getState().ComMemID,
      operation: 'modify'
    }

    if(DrawerTitle === '新增典当行'){
      axios({
        method: 'post',
        url: 'http://localhost:3000/addPawnshop',
        data: Qs.stringify(data)
      }).then(response=>{
        if(response.data!==''){
          notification['error']({
            message: '注意',
            description: response.data,
            duration: 2
          });
        }else{
          notification['success']({
            message: '消息',
            description:<div style={{whiteSpace: 'pre-wrap'}}>已成功添加{PSName}</div>,
            duration: 2
          });
        }
        this.getData();
      }).catch(error=>{
        console.log(error);
        notification['error']({
          message: '注意',
          description: '出错啦!!!',
          duration: 2
        });
      });
    }else if(DrawerTitle === '编辑当行信息'){
      axios({
        method: 'post',
        url: 'http://localhost:3000/modPawnshop',
        data: Qs.stringify(data)
      }).then(response=>{
        if(response.data!==''){
          notification['error']({
            message: '注意',
            description: response.data,
            duration: 2
          });
        }else{
          notification['success']({
            message: '消息',
            description:<div style={{whiteSpace: 'pre-wrap'}}>已成功修改{PSName}信息</div>,
            duration: 2
          });
        }
        this.getData();
      }).catch(error=>{
        console.log(error);
        notification['error']({
          message: '注意',
          description: '出错啦!!!',
          duration: 2
        });
      });
    }

    this.onClose();
  };

  render() {
    const { dataSource,PSID,PSName,Address,PSstaffName,Identification,RegCapital,FoundDate,BusinessTerm,PermitCode,PermitAuthority,PermitDate,BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID,AuditState,ComMemID } = this.state;
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
          <Breadcrumb.Item>资质管理</Breadcrumb.Item>
          <Breadcrumb.Item>当行信息管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Button type="primary" onClick={this.showDrawer} icon={<PlusOutlined />} style={{marginBottom: 16}}>
            新增典当行
          </Button>
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
                  const { PSID,PSName,Address,RegCapital,FoundDate,BusinessTerm,Representative,PSstaffName,Identification,PermitCode,PermitAuthority,PermitDate,BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID,AuditState,ComMemID } = record
                  this.setState({
                    PSID,PSName,Address,RegCapital,FoundDate,BusinessTerm,Representative,PSstaffName,Identification,PermitCode,PermitAuthority,PermitDate,BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID,AuditState,ComMemID,
                    DrawerTitle: '编辑当行信息',
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
          title={this.state.DrawerTitle}
          width={720}
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
          initialValues={{PSID,PSName,Address,RegCapital,FoundDate:moment(FoundDate),BusinessTerm,PSstaffName,Identification,PermitCode,PermitAuthority,PermitDate:moment(PermitDate),BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID}}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PSID"
                  label="当行编号"
                  rules={[{ required: true, message: '请输入当行编号' }]}
                >
                  <Input value={this.state.PSID} placeholder="请输入当行编号" onChange={this.handleID} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PSName"
                  label="当行名称"
                  rules={[{ required: true, message: '请输入当行名称' }]}
                >
                  <Input value={this.state.PSName} placeholder="请输入当行名称" onChange={this.handleName} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Address"
                  label="详细地址"
                  rules={[{ required: true, message: '请输入详细地址' }]}
                >
                  <Input.TextArea rows={3} value={this.state.Address} onChange={this.handleAddress} placeholder="请输入详细地址" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="IsBranch"
                  label="是否为分行"
                  rules={[{ required: true, message: '请选择是否为分行' }]}
                >
                  <Select value={this.state.IsBranch} onChange={this.handleIsBranch} placeholder="选择是否为分行">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="HeadOfficeID"
                  label="所属总行"
                  rules={[{ required: true, message: '请选择所属总行' }]}
                >
                  <Select value={this.state.HeadOfficeID} onChange={this.handleHeadOfficeID} placeholder="选择所属总行">
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
                  rules={[{ required: true, message: '请选择成立时间' }]}
                >
                  <DatePicker style={{ width: '100%' }} value={this.state.FoundDate} onChange={this.handleFoundDate} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="BusinessTerm"
                  label="营业期限"
                  rules={[{ required: true, message: '请输入营业期限' }]}
                >
                  <Input value={this.state.BusinessTerm} placeholder="请输入营业期限" onChange={this.handleBusinessTerm} />
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
                  <Input value={this.state.PSstaffName} placeholder="请输入法定代表人" onChange={this.handlePSstaffName} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Identification"
                  label="代表人证件号"
                  rules={[{ required: true, message: '请输入代表人证件号' }]}
                >
                  <Input value={this.state.Identification} placeholder="请输入代表人证件号" onChange={this.handleRID} />
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
                  <Input value={this.state.SocCreCode} onChange={this.handleSocCreCode} placeholder="请输入统一社会信用代码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="RegCapital"
                  label="注册资本"
                  rules={[{ required: true, message: '请输入注册资本' }]}
                >
                  <Input value={this.state.RegCapital} placeholder="请输入注册资本" onChange={this.handleRegCapital} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PermitCode"
                  label="经营许可证编码"
                  rules={[{ required: true, message: '请输入经营许可证编码' }]}
                >
                  <Input value={this.state.PermitCode} onChange={this.handlePermitCode} placeholder="请输入经营许可证编码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PermitDate"
                  label="许可证发证日期"
                  rules={[{ required: true, message: '请选择许可证发证日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} value={this.state.PermitDate} onChange={this.handlePermitDate} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PermitAuthority"
                  label="许可证批准机关"
                  rules={[{ required: true, message: '请输入许可证批准机关' }]}
                >
                  <Input value={this.state.PermitAuthority} onChange={this.handlePermitAuthority} placeholder="请输入许可证批准机关" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="BLicenseAuthority"
                  label="营业执照登记机关"
                  rules={[{ required: true, message: '请输入营业执照登记机关' }]}
                >
                  <Input value={this.state.BLicenseAuthority} onChange={this.handleBLicenseAuthority} placeholder="请输入营业执照登记机关" />
                </Form.Item>
              </Col>
            </Row>  
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Phone"
                  label="联系电话"
                  rules={[{ required: true, message: '请输入联系电话' }]}
                >
                  <Input value={this.state.Phone} onChange={this.handlePhone} placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Zip"
                  label="邮政编码"
                  rules={[{ required: true, message: '请输入邮政编码' }]}
                >
                  <Input value={this.state.Zip} onChange={this.handleZip} placeholder="请输入邮政编码" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Description"
                  label="简介"
                >
                  <Input.TextArea rows={4} value={this.state.Description} onChange={this.handleDescription} placeholder="请输入简介" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>
      </div>
    )
  }
}
