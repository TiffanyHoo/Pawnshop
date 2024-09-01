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
  Popconfirm,
  Form,
  Drawer,
  Col,
  Row,
  Select,
  DatePicker,
  Switch,
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

export default class Pawner extends Component {
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
              典当权限 :{' '}
              <Switch
                checked={record.AuditState === '1' ? true : false}
                onChange={(e) => this.handleAuditState(e, record.UserID)}
              />
            </div>
          ) : null,
      },
      {
        title: '证件号',
        dataIndex: 'UserID',
        key: 'UserID',
        editable: false,
        width: '180px',
      },
      {
        title: '姓名',
        dataIndex: 'UserName',
        key: 'UserName',
        width: '100px',
      },
      {
        title: '性别',
        dataIndex: 'GenderChar',
        key: 'GenderChar',
        width: '80px',
      },
      {
        title: '出生日期',
        dataIndex: 'BirthDate',
        key: 'BirthDate',
        width: '120px',
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
        width: '130px',
      },
    ];

    this.state = {
      visible: false,
      dataSource: [],
      count: 0,
      UserID: '',
      UserName: '',
      Gender: '',
      BirthDate: '',
      Address: '',
      Phone: '',
      Email: '',
      Wechat: '',
      IDcardFront: '',
      IDcardBack: '',
      AuditState: '',
    };
  }

  formRef = React.createRef();

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    let dataSource = [];
    await axios
      .get('/getUsers')
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
      return {
        ...obj,
        key: index,
        GenderChar: obj.Gender === '0' ? '男' : '女',
      };
    });

    this.setState({
      dataSource,
      count: dataSource.length,
    });
  };

  handleAuditState = (e, UserID) => {
    const {
      UserName,
      Gender,
      BirthDate,
      Address,
      Phone,
      Email,
      Wechat,
      IDcardFront,
      IDcardBack,
    } = this.state;

    let data = {};
    if (e) {
      data = {
        UserID,
        UserName: '',
        Gender,
        BirthDate,
        Address,
        Phone,
        Email,
        Wechat,
        AuditState: 1,
      };
    } else {
      data = {
        UserID,
        UserName: '',
        Gender,
        BirthDate,
        Address,
        Phone,
        Email,
        Wechat,
        AuditState: 0,
      };
    }

    axios({
      method: 'post',
      url: 'http://localhost:3000/modUser',
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
            description: e ? (
              <div style={{ whiteSpace: 'pre-wrap' }}>
                已开启用户{UserName}的典当权限
              </div>
            ) : (
              <div style={{ whiteSpace: 'pre-wrap' }}>
                已关闭用户{UserName}的典当权限
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
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
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
          <Breadcrumb.Item>典当监管</Breadcrumb.Item>
          <Breadcrumb.Item>当户信息管理</Breadcrumb.Item>
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
            onRow={(record) => {
              return {
                onDoubleClick: (event) => {
                  //console.log(record)
                  const {
                    UserID,
                    UserName,
                    Gender,
                    BirthDate,
                    Address,
                    Phone,
                    Email,
                    Wechat,
                    IDcardFront,
                    IDcardBack,
                  } = record;
                  this.setState({
                    UserID,
                    UserName,
                    Gender,
                    BirthDate,
                    Address,
                    Phone,
                    Email,
                    Wechat,
                    IDcardFront,
                    IDcardBack,
                    visible: true,
                  });
                  setTimeout(() => {
                    this.formRef.current.setFieldsValue({
                      UserID,
                      UserName,
                      Gender,
                      BirthDate: moment(BirthDate),
                      Address,
                      Phone,
                      Email,
                      Wechat,
                    });
                  }, 100);
                },
              };
            }}
          />
        </div>
        <Drawer
          title="当户详细信息"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
        >
          <Form layout="vertical" ref={this.formRef}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="UserID" label="证件号">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="UserName" label="姓名">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="Gender" label="性别">
                  <Select disabled>
                    <Option value="0">男</Option>
                    <Option value="1">女</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="BirthDate" label="出生日期">
                  <DatePicker style={{ width: '100%' }} disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="Address" label="详细住址">
                  <Input.TextArea rows={3} disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="Phone" label="联系电话">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="Wechat" label="微信号">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="Email" label="邮箱地址">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>
      </div>
    );
  }
}
