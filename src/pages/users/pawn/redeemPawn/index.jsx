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
import '../../../../style/common.less';
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

export default class RedeemPawn extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '工号',
        dataIndex: 'ComMemID',
        key: 'ComMemID',
        editable: false,
      },
      {
        title: '姓名',
        dataIndex: 'ComMemName',
        key: 'ComMemName',
      },
      {
        title: '性别',
        dataIndex: 'Gender',
        key: 'Gender',
        width: '10%',
      },
      {
        title: '出生日期',
        dataIndex: 'BirthDate',
        key: 'BirthDate',
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
        title: 'operation',
        dataIndex: 'operation',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.handleDelete(record.key)}
            >
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];

    this.state = {
      visible: false,
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

  async componentDidMount() {
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
      return {
        ...obj,
        key: index,
      };
    });

    this.setState({
      dataSource,
      count: dataSource.length,
    });
  }

  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
    });
  };
  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      name: `Edward King ${count}`,
      age: '32',
      address: `London, Park Lane no. ${count}`,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
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
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  onSubmit = async () => {
    console.log(this.state);

    await axios
      .post('/addComMem', {
        ComMemID: this.state.ComMemID,
        ComMemName: this.state.ComMemName,
        Gender: this.state.Gender,
        BirthDate: this.state.BirthDate,
        Address: this.state.Address,
        Phone: this.state.Phone,
        Email: this.state.Email,
        Notes: this.state.Notes,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });

    notification.open({
      message: 'Notification',
      description: (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          已成功添加人员
          <br />
          初始密码为123456
        </div>
      ),
      icon: <SmileOutlined style={{ color: 'orange' }} />,
      duration: 2,
    });
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
          <Breadcrumb.Item>典当业务</Breadcrumb.Item>
          <Breadcrumb.Item>赎当申请</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Form layout="vertical" ref={this.formRef} hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ComMemID"
                  label="工号"
                  rules={[{ required: true, message: '请输入工号' }]}
                >
                  <Input
                    value={this.state.ComMemID}
                    placeholder="请输入工号"
                    onChange={this.handleID}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ComMemName"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input
                    value={this.state.ComMemName}
                    placeholder="请输入姓名"
                    onChange={this.handleName}
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
                    onChange={this.handleGender}
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
                    value={this.state.BirthDate}
                    onChange={this.handleDate}
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
                    value={this.state.Address}
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
                    value={this.state.Phone}
                    onChange={this.handlePhone}
                    placeholder="请输入联系电话"
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
                    value={this.state.Email}
                    onChange={this.handleEmail}
                    placeholder="请输入邮箱地址"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Notes"
                  label="备注"
                  rules={[
                    {
                      required: true,
                      message: '请输入备注',
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    value={this.state.Notes}
                    onChange={this.handleNotes}
                    placeholder="请输入备注"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}
