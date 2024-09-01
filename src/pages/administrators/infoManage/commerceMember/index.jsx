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
} from 'antd';
import axios from 'axios';
import Qs from 'qs';
import '../../../../style/common.less';
//import 'antd/dist/antd.css';
import { PlusOutlined, SmileOutlined } from '@ant-design/icons';
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

export default class CommerceMember extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '操作',
        dataIndex: 'operation',
        width: '150px',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              <Popconfirm
                title="确认初始化密码吗?"
                onConfirm={() => this.initialPwd(record)}
              >
                <a>初始化密码</a>
              </Popconfirm>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Popconfirm
                title="确认删除人员吗?"
                onConfirm={() => this.delMember(record)}
              >
                <a>删除</a>
              </Popconfirm>
            </div>
          ) : null,
      },
      {
        title: '工号',
        dataIndex: 'ComMemID',
        key: 'ComMemID',
        editable: false,
        width: '8%',
      },
      {
        title: '姓名',
        dataIndex: 'ComMemName',
        key: 'ComMemName',
        width: '10%',
      },
      {
        title: '性别',
        dataIndex: 'GenderChar',
        key: 'GenderChar',
        width: '8%',
      },
      {
        title: '出生日期',
        dataIndex: 'BirthDate',
        key: 'BirthDate',
        width: '12%',
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
        width: '12%',
      },
      {
        title: '邮箱',
        dataIndex: 'Email',
        key: 'Email',
        ellipsis: {
          showTitle: false,
        },
        render: (Email) => (
          <Tooltip placement="topLeft" title={Email}>
            {Email}
          </Tooltip>
        ),
      },
    ];

    this.state = {
      visible: false,
      DrawerTitle: '新增商务部人员',
      dataSource: [],
      count: 0,
      ComMemID: '',
      ComMemName: '',
      Gender: '',
      BirthDate: '',
      Address: '',
      Phone: '',
      Email: '',
      Notes: '',
    };
  }

  componentDidMount() {
    this.getData();
  }

  formRef = React.createRef();

  getData = async () => {
    let dataSource = [];
    await axios
      .get('/getComMem')
      .then((response) => {
        if (response.data.length === 0) {
          console.log('无数据');
        } else {
          dataSource = response.data;
        }
      })
      .catch((error) => {
        console.log(error);
      });

    dataSource = dataSource.map((obj, index) => {
      if (obj.Gender === '0') {
        return {
          ...obj,
          GenderChar: '男',
          key: index,
        };
      } else if (obj.Gender === '1') {
        return {
          ...obj,
          GenderChar: '女',
          key: index,
        };
      } else {
      }
    });

    this.setState({
      dataSource,
      count: dataSource.length,
    });
  };

  //初始化密码
  initialPwd = (record) => {
    let data = {
      id: record.ComMemID,
      usertype: 'ComMem',
    };

    axios({
      method: 'post',
      url: 'http://localhost:3000/initialPwd',
      data: Qs.stringify(data),
    })
      .then((response) => {
        notification.open({
          message: '消息',
          description: (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {record.ComMemID}&nbsp;{record.ComMemName}&nbsp;已成功初始化密码
              <br />
              初始密码为123456
            </div>
          ),
          icon: <SmileOutlined style={{ color: 'orange' }} />,
          duration: 2,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //删除人员
  delMember = (record) => {
    let data = {
      id: record.ComMemID,
      usertype: 'ComMem',
    };

    axios({
      method: 'post',
      url: 'http://localhost:3000/delMember',
      data: Qs.stringify(data),
    })
      .then((response) => {
        if (response.data !== '') {
          notification['error']({
            message: '注意',
            description: response.data,
            duration: 2,
          });
        } else {
          notification['warning']({
            message: '消息',
            description: (
              <p>
                已删除人员&nbsp;{record.UserID}&nbsp;{record.UserName}
              </p>
            ),
          });
        }
        this.getData();
      })
      .catch((error) => {
        console.log(error);
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

  handleID = (e) => {
    this.setState({
      ComMemID: e.target.value,
    });
  };

  handleName = (e) => {
    this.setState({
      ComMemName: e.target.value,
    });
  };

  handleGender = (e) => {
    this.setState({
      Gender: e,
    });
  };

  handleDate = (date, dateString) => {
    this.setState({
      BirthDate: dateString,
    });
  };

  handleAddress = (e) => {
    this.setState({
      Address: e.target.value,
    });
  };

  handlePhone = (e) => {
    this.setState({
      Phone: e.target.value,
    });
  };

  handleEmail = (e) => {
    this.setState({
      Email: e.target.value,
    });
  };

  handleNotes = (e) => {
    this.setState({
      Notes: e.target.value,
    });
  };

  showDrawer = () => {
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
      DrawerTitle: '新增商务部人员',
    });
    setTimeout(() => {
      this.formRef.current.resetFields();
      this.formRef.current.setFieldsValue({
        BirthDate: '',
      });
    }, 200);
  };

  onClose = () => {
    this.setState({
      visible: false,
      ComMemID: '',
      ComMemName: '',
      Gender: '',
      BirthDate: '',
      Address: '',
      Phone: '',
      Email: '',
      Notes: '',
    });
  };

  onSubmit = async () => {
    const {
      DrawerTitle,
      ComMemID,
      ComMemName,
      Gender,
      BirthDate,
      Address,
      Phone,
      Email,
      Notes,
    } = this.state;

    if (
      ComMemID === '' ||
      ComMemName === '' ||
      Gender === '' ||
      BirthDate === '' ||
      Phone === ''
    ) {
      notification['error']({
        message: '注意',
        description: '有必填字段未填写!',
        duration: 2,
      });
      return;
    }

    let data = {
      ComMemID,
      ComMemName,
      Gender,
      BirthDate,
      Address,
      Phone,
      Email,
      Notes,
    };

    if (DrawerTitle === '新增商务部人员') {
      axios({
        method: 'post',
        url: 'http://localhost:3000/addComMem',
        data: Qs.stringify(data),
      })
        .then((response) => {
          if (response.data !== '') {
            notification['error']({
              message: '注意',
              description: response.data,
              duration: 2,
            });
          } else {
            notification['success']({
              message: '消息',
              description: (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  已成功添加人员{ComMemID}
                  <br />
                  初始密码为123456
                </div>
              ),
              duration: 2,
            });
          }
          this.getData();
        })
        .catch((error) => {
          console.log(error);
          notification['error']({
            message: '注意',
            description: '出错啦!!!',
            duration: 2,
          });
        });
    } else if (DrawerTitle === '编辑人员信息') {
      axios({
        method: 'post',
        url: 'http://localhost:3000/modComMem',
        data: Qs.stringify(data),
      })
        .then((response) => {
          if (response.data !== '') {
            notification['error']({
              message: '注意',
              description: response.data,
              duration: 2,
            });
          } else {
            notification['success']({
              message: '消息',
              description: (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  已成功修改{ComMemID}人员信息
                </div>
              ),
              duration: 2,
            });
          }
          this.getData();
        })
        .catch((error) => {
          console.log(error);
          notification['error']({
            message: '注意',
            description: '出错啦!!!',
            duration: 2,
          });
        });
    }
    // setTimeout(() => {
    //   this.getData();
    // }, 1000);
    this.onClose();
  };

  render() {
    const { dataSource } = this.state;
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
          <Breadcrumb.Item>信息管理</Breadcrumb.Item>
          <Breadcrumb.Item>商务部人员管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Button
            type="primary"
            onClick={this.showDrawer}
            icon={<PlusOutlined />}
            style={{ marginBottom: 16 }}
          >
            新增人员
          </Button>
          <Table
            size="small"
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 10 }}
            onRow={(record) => {
              return {
                onDoubleClick: (event) => {
                  const {
                    ComMemID,
                    ComMemName,
                    Gender,
                    BirthDate,
                    Address,
                    Phone,
                    Email,
                    Notes,
                  } = record;
                  this.setState({
                    ComMemID,
                    ComMemName,
                    Gender,
                    BirthDate,
                    Address,
                    Phone,
                    Email,
                    Notes,
                    DrawerTitle: '编辑人员信息',
                    visible: true,
                  });
                  setTimeout(() => {
                    this.formRef.current.setFieldsValue({
                      ComMemID,
                      ComMemName,
                      Gender,
                      BirthDate: moment(BirthDate),
                      Address,
                      Phone,
                      Email,
                      Notes,
                    });
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
              <Button type="primary" htmlType="submit" onClick={this.onSubmit}>
                Submit
              </Button>
            </Space>
          }
        >
          <Form layout="vertical" ref={this.formRef}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ComMemID"
                  label="工号"
                  rules={[{ required: true, message: '请输入工号' }]}
                >
                  <Input placeholder="请输入工号" onChange={this.handleID} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ComMemName"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input placeholder="请输入姓名" onChange={this.handleName} />
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
                    onChange={this.handleGender}
                    placeholder="请选择性别"
                  >
                    <Option value="0">男</Option>
                    <Option value="1">女</Option>
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
                    onChange={this.handleDate}
                    disabledDate={(current) => {
                      return current && current > moment().endOf('day');
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="Address" label="详细住址">
                  <Input.TextArea
                    rows={3}
                    onChange={this.handleAddress}
                    placeholder="请输入详细住址"
                  />
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
                  <Input
                    onChange={this.handlePhone}
                    placeholder="请输入联系电话"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="Email" label="邮箱地址">
                  <Input
                    onChange={this.handleEmail}
                    placeholder="请输入邮箱地址"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="Notes" label="备注">
                  <Input.TextArea
                    rows={4}
                    onChange={this.handleNotes}
                    placeholder="请输入备注"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>
      </div>
    );
  }
}
