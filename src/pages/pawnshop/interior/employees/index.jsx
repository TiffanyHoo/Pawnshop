import React, {
  Component,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  Breadcrumb,
  Table,
  Input,
  Button,
  Popconfirm,
  Form,
  Drawer,
  Col,
  Row,
  Select,
  DatePicker,
  Space,
  Tooltip,
  notification,
  Modal,
  message,
} from 'antd';
import axios from 'axios';
import Qs from 'qs';
import store from '../../../../redux/store';
import { createPawnshopstaffAction } from '../../../../redux/UserInfoAction';
import '../../../../style/common.less';
//import 'antd/dist/antd.css';
import { PlusOutlined, SmileOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';

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

export default class Employees extends Component {
  constructor(props) {
    super(props);

    //PSstaffID,PSID,PSstaffName,Pwd,Gender,Identification,BirthDate,Address,Phone,Email,Wechat,BoardDate,QuitDate,InServiceState,IsRepresentative
    this.columns = [
      {
        title: '工号',
        dataIndex: 'PSstaffID',
        key: 'PSstaffID',
        editable: false,
        width: '90px',
      },
      {
        title: '姓名',
        dataIndex: 'PSstaffName',
        key: 'PSstaffName',
        width: '80px',
      },
      {
        title: '性别',
        dataIndex: 'Gender',
        key: 'Gender',
        width: '10%',
        width: '70px',
      },
      {
        title: '证件号',
        dataIndex: 'Identification',
        key: 'Identification',
        width: '166px',
      },
      {
        title: '出生日期',
        dataIndex: 'BirthDate',
        key: 'BirthDate',
        width: '90px',
      },
      {
        title: '地址',
        dataIndex: 'Address',
        key: 'Address',
        ellipsis: {
          showTitle: false,
        },
        render: (Address) => (
          <Tooltip placement="topLeft" title={Address}>
            {Address}
          </Tooltip>
        ),
      },
      {
        title: '联系电话',
        dataIndex: 'Phone',
        key: 'Phone',
      },
      {
        title: '邮箱',
        dataIndex: 'Email',
        key: 'Email',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              <Popconfirm
                title="确认辞退该员工吗?"
                onConfirm={() => this.handleDelete(record.key)}
              >
                <a>辞退</a>
              </Popconfirm>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Popconfirm
                title="确认删除该员工吗?"
                onConfirm={() => this.handleDelete(record.key)}
              >
                <a>删除</a>
              </Popconfirm>
            </div>
          ) : null,
        width: '100px',
      },
    ];

    this.columns2 = [
      {
        title: '工号',
        dataIndex: 'PSstaffID',
        key: 'PSstaffID',
        editable: false,
      },
      {
        title: '姓名',
        dataIndex: 'PSstaffName',
        key: 'PSstaffName',
      },
      {
        title: '性别',
        dataIndex: 'Gender',
        key: 'Gender',
        width: '10%',
      },
      {
        title: '地址',
        dataIndex: 'Address',
        key: 'Address',
        ellipsis: {
          showTitle: false,
        },
      },
      {
        title: '联系电话',
        dataIndex: 'Phone',
        key: 'Phone',
      },
      {
        title: '邮箱',
        dataIndex: 'Email',
        key: 'Email',
      },
      {
        title: '微信号',
        dataIndex: 'Wechat',
        key: 'Wechat',
      },
    ];

    this.state = {
      personal: {},
      PwdEdit: false,
      oldPwd: '',
      newPwd: '',
      visible: false,
      DrawerTitle: '新增人员',
      dataSource: [],
      count: 0,

      PSstaffID: '',
      PSID: '',
      PSstaffName: '',
      Pwd: '',
      Gender: '',
      Identification: '',
      BirthDate: '',
      Address: '',
      Phone: '',
      Email: '',
      Wechat: '',
      BoardDate: '',
      QuitDate: '',
      InServiceState: '',
      IsRepresentative: '',
      Notes: '',
    };
  }

  formRef = React.createRef();

  componentDidMount() {
    this.getData();
  }

  componentWillUnmount() {}

  getData = async () => {
    var that = this;
    let dataSource = [];
    const { PSstaffID } = store.getState();

    if (store.getState().IsRepresentative === '1') {
      console.log(1);
      await axios
        .get('/getPSstaff', {
          params: {
            id: store.getState().PSID,
            usertype: 'Representative',
          },
        })
        .then((response) => {
          if (response.data.length === 0) {
            console.log('无数据');
          } else {
            dataSource = response.data;
            console.log(dataSource);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (store.getState().IsRepresentative === '0') {
      await axios
        .get('/getPSstaff', {
          params: {
            id: store.getState().PSID,
            usertype: 'Emplyee',
          },
        })
        .then(async (response) => {
          if (response.data.length === 0) {
            console.log('无数据');
          } else {
            dataSource = response.data;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
    }

    const personal = await dataSource.find(function (obj) {
      return obj.PSstaffID === PSstaffID;
    });
    const {
      PSID,
      PSstaffName,
      Pwd,
      Gender,
      Identification,
      BirthDate,
      Address,
      Phone,
      Email,
      Wechat,
      BoardDate,
      QuitDate,
      InServiceState,
      IsRepresentative,
      Notes,
    } = personal;
    that.setState({
      dataSource,
      count: dataSource.length,
      DrawerTitle: '编辑个人信息',
      personal,
      PSstaffID,
      PSID,
      PSstaffName,
      Pwd,
      Gender,
      Identification,
      BirthDate,
      Address,
      Phone,
      Email,
      Wechat,
      BoardDate,
      QuitDate,
      InServiceState,
      IsRepresentative,
      Notes,
    });
    store.dispatch(createPawnshopstaffAction(personal));
  };

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

  showDrawer = () => {
    if (store.getState().IsRepresentative === '1') {
      this.setState({
        ComMemID: '',
        ComMemName: '',
        Gender: '',
        BirthDate: '',
        Address: '',
        Phone: '',
        Email: '',
        Notes: '',
        visible: true,
        DrawerTitle: '新增人员信息',
      });
      setTimeout(() => {
        this.formRef.current.resetFields();
        this.formRef.current.setFieldsValue({
          BirthDate: '',
        });
      }, 200);
    } else {
      const {
        PSstaffID,
        PSstaffName,
        Pwd,
        Gender,
        Identification,
        BirthDate,
        Address,
        Phone,
        Email,
        Wechat,
        BoardDate,
        QuitDate,
        InServiceState,
        IsRepresentative,
        Notes,
      } = this.state;
      this.setState({ visible: true });
      setTimeout(() => {
        this.formRef.current.setFieldsValue({
          PSstaffID,
          PSstaffName,
          Pwd,
          Gender,
          Identification,
          BirthDate: moment(BirthDate),
          Address,
          Phone,
          Email,
          Wechat,
          BoardDate: moment(BoardDate),
          InServiceState,
          IsRepresentative,
          Notes,
        });
      }, 100);
    }
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  onSubmit = async () => {
    var that = this;
    const {
      DrawerTitle,
      PSstaffID,
      PSstaffName,
      Gender,
      Identification,
      BirthDate,
      Address,
      Phone,
      Email,
      Wechat,
      BoardDate,
      QuitDate,
      InServiceState,
      Notes,
    } = this.state;

    if (DrawerTitle === '编辑个人信息') {
      let data = {
        PSstaffID,
        PSstaffName,
        Gender,
        Identification,
        BirthDate,
        Address,
        Phone,
        Email,
        Wechat,
        BoardDate,
        QuitDate,
        InServiceState: '1',
        Notes,
      };
      axios({
        method: 'post',
        url: 'http://localhost:3000/modPSstaff',
        data: Qs.stringify(data),
      })
        .then((response) => {
          notification['success']({
            message: '消息',
            description: (
              <div style={{ whiteSpace: 'pre-wrap' }}>已成功修改信息</div>
            ),
            duration: 2,
          });
          that.getData();
        })
        .catch((error) => {
          notification['error']({
            message: '注意',
            description: '出错啦!!!',
            duration: 2,
          });
        });
    } else if (DrawerTitle === '编辑人员信息') {
    } else {
    }

    this.onClose();
  };

  modPwd = () => {
    const { PSstaffID, Pwd, oldPwd, newPwd, personal } = this.state;
    if (Pwd !== oldPwd) {
      message.warning('原密码有误!');
      return;
    }
    if (newPwd === '') {
      message.warning('请输入新密码!');
      return;
    }
    if (newPwd.length < 6) {
      message.warning('密码设置不得少于6位!');
      return;
    }
    if (newPwd === Pwd) {
      message.warning('新密码与原密码相同!');
      return;
    }

    let data = {
      id: PSstaffID,
      Pwd: newPwd,
      usertype: 'PSstaff',
    };
    axios({
      method: 'post',
      url: 'http://localhost:3000/modPwd',
      data: Qs.stringify(data),
    })
      .then((response) => {
        notification.open({
          message: '消息',
          description: (
            <div style={{ whiteSpace: 'pre-wrap' }}>您已成功修改密码</div>
          ),
          icon: <SmileOutlined style={{ color: 'orange' }} />,
          duration: 2,
        });
      })
      .catch((error) => {
        console.log(error);
      });
    personal.Pwd = newPwd;
    this.setState({
      personal,
      PwdEdit: false,
      Pwd: newPwd,
      oldPwd: '',
      newPwd: '',
    });
    store.dispatch(createPawnshopstaffAction(personal));
  };

  render() {
    const {
      PwdEdit,
      dataSource,
      PSstaffID,
      PSID,
      PSstaffName,
      Pwd,
      Gender,
      Identification,
      BirthDate,
      Address,
      Phone,
      Email,
      Wechat,
      BoardDate,
      QuitDate,
      InServiceState,
      IsRepresentative,
      Notes,
    } = this.state;
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

    const columns2 = this.columns2.map((col) => {
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
          <Breadcrumb.Item>信息管理</Breadcrumb.Item>
          <Breadcrumb.Item>员工信息管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          {store.getState().IsRepresentative === '1' ? (
            <Button
              type="primary"
              onClick={() =>
                this.setState({ visible: true, DrawerTitle: '新增人员信息' })
              }
              icon={<PlusOutlined />}
              style={{ marginBottom: 16 }}
            >
              新增人员
            </Button>
          ) : (
            <Space>
              <Button
                type="primary"
                onClick={this.showDrawer}
                icon={<PlusOutlined />}
                style={{ marginBottom: 16 }}
              >
                编辑个人信息
              </Button>
              <Button
                type="primary"
                onClick={() => this.setState({ PwdEdit: true })}
                icon={<EditOutlined />}
                style={{ marginBottom: 16 }}
              >
                修改密码
              </Button>
            </Space>
          )}
          <Table
            size="small"
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={
              store.getState().IsRepresentative === '1' ? columns : columns2
            }
            pagination={{ pageSize: 5 }}
            onRow={(record) => {
              return {
                onDoubleClick: (event) => {
                  if (store.getState().IsRepresentative === '1') {
                    const {
                      PSstaffID,
                      PSID,
                      PSstaffName,
                      Pwd,
                      Gender,
                      Identification,
                      BirthDate,
                      Address,
                      Phone,
                      Email,
                      Wechat,
                      BoardDate,
                      QuitDate,
                      InServiceState,
                      IsRepresentative,
                      Notes,
                    } = record;
                    this.setState({
                      PSstaffID,
                      PSID,
                      PSstaffName,
                      Pwd,
                      Gender,
                      Identification,
                      BirthDate,
                      Address,
                      Phone,
                      Email,
                      Wechat,
                      BoardDate,
                      QuitDate,
                      InServiceState,
                      IsRepresentative,
                      Notes,
                      DrawerTitle: '编辑人员信息',
                      visible: true,
                    });
                    setTimeout(() => {
                      this.formRef.current.setFieldsValue({
                        PSstaffID,
                        PSstaffName,
                        Pwd,
                        Gender,
                        Identification,
                        BirthDate: moment(BirthDate),
                        Address,
                        Phone,
                        Email,
                        Wechat,
                        BoardDate: moment(BoardDate),
                        QuitDate: moment(QuitDate),
                        InServiceState,
                        IsRepresentative,
                        Notes,
                      });
                    }, 100);
                  }
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
          <Form layout="vertical" ref={this.formRef} hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PSstaffID"
                  label="工号"
                  rules={[{ required: true, message: '请输入工号' }]}
                >
                  <Input
                    placeholder="请输入工号"
                    onChange={(e) =>
                      this.setState({ PSstaffID: e.target.value })
                    }
                    disabled={
                      store.getState().IsRepresentative === '1' ? false : true
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PSstaffName"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input
                    value={this.state.PSstaffName}
                    placeholder="请输入姓名"
                    onChange={(e) =>
                      this.setState({ PSstaffName: e.target.value })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Gender"
                  label="性别"
                  rules={[{ required: true, message: '请选择性别' }]}
                >
                  <Select
                    value={this.state.Gender}
                    onChange={(e) => this.setState({ Gender: e })}
                    placeholder="选择性别"
                  >
                    <Option value="男">男</Option>
                    <Option value="女">女</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="BirthDate"
                  label="出生日期"
                  rules={[{ required: true, message: '请选择出生日期' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    onChange={(date, dateString) => {
                      this.setState({ BirthDate: dateString });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Address"
                  label="详细住址"
                  rules={[{ required: true, message: '请输入详细住址' }]}
                >
                  <Input.TextArea
                    rows={3}
                    onChange={(e) => this.setState({ Address: e.target.value })}
                    placeholder="请输入详细住址"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Identification"
                  label="身份证号码"
                  rules={[{ required: true, message: '请输入身份证号码' }]}
                >
                  <Input
                    onChange={(e) => {
                      this.setState({ Identification: e.target.value });
                    }}
                    placeholder="请输入身份证号码"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Phone"
                  label="联系电话"
                  rules={[{ required: true, message: '请输入联系电话' }]}
                >
                  <Input
                    onChange={(e) => {
                      this.setState({ Phone: e.target.value });
                    }}
                    placeholder="请输入联系电话"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Wechat"
                  label="邮箱地址"
                  rules={[{ required: true, message: '请输入邮箱地址' }]}
                >
                  <Input
                    onChange={(e) => {
                      this.setState({ Wechat: e.target.value });
                    }}
                    placeholder="请输入邮箱地址"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Email"
                  label="邮箱地址"
                  rules={[{ required: true, message: '请输入邮箱地址' }]}
                >
                  <Input
                    onChange={(e) => {
                      this.setState({ Email: e.target.value });
                    }}
                    placeholder="请输入邮箱地址"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="BoardDate"
                  label="入职日期"
                  rules={[{ required: true, message: '请选择入职日期' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    onChange={(date, dateString) => {
                      this.setState({ BirthDate: dateString });
                    }}
                    disabled={
                      store.getState().IsRepresentative === '1' ? false : true
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="QuitDate"
                  label="离职日期"
                  rules={[{ required: true, message: '请选择离职日期' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    onChange={(date, dateString) => {
                      this.setState({ QuitDate: dateString });
                    }}
                    disabled={
                      store.getState().IsRepresentative === '1' ? false : true
                    }
                    placeholder="请选择离职日期"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Notes"
                  label="备注"
                  rules={[{ required: true, message: '请输入备注' }]}
                >
                  <Input.TextArea
                    rows={3}
                    onChange={(e) => this.setState({ Notes: e.target.value })}
                    placeholder="请输入备注"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>
        <Modal
          title="修改密码"
          centered
          visible={PwdEdit}
          onOk={this.modPwd}
          onCancel={() => {
            this.setState({ PwdEdit: false, oldPwd: '', newPwd: '' });
          }}
          width={260}
          bodyStyle={{ padding: 10 }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input.Password
              value={this.state.oldPwd}
              placeholder="请输入原密码"
              showCount
              maxLength={20}
              onChange={(e) => this.setState({ oldPwd: e.target.value })}
            />
            <Input.Password
              value={this.state.newPwd}
              placeholder="请输入新密码"
              showCount
              maxLength={20}
              onChange={(e) => this.setState({ newPwd: e.target.value })}
            />
          </Space>
        </Modal>
      </div>
    );
  }
}
