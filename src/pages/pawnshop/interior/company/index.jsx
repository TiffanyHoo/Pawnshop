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
import moment from 'moment';
import store from '../../../../redux/store';
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

export default class Company extends Component {
  constructor(props) {
    super(props);
    //PSID,PSName,Address,RegCapital,FoundDate,BusinessTerm,Representative,PermitCode,PermitAuthority,PermitDate,BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID,AuditState,InfoChange,ComMemID

    this.columns = [
      {
        title: '当行编号',
        dataIndex: 'PSID',
        key: 'PSID',
        editable: false,
        width: '100px',
      },
      {
        title: '当行名称',
        dataIndex: 'PSName',
        key: 'PSName',
      },
      {
        title: '注册资本',
        dataIndex: 'RegCapital',
        key: 'RegCapital',
        width: '100px',
      },
      {
        title: '成立时间',
        dataIndex: 'FoundDate',
        key: 'FoundDate',
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
        title: '法定代表人',
        dataIndex: 'Representative',
        key: 'Representative',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '90px',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm
              title="确认删除吗?"
              onConfirm={() => this.handleDelete(record.key)}
            >
              <a>删除</a>
            </Popconfirm>
          ) : null,
      },
    ];

    this.state = {
      visible: false,
      dataSource: [],
      count: 0,

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
      InfoChange: '',
      ComMemID: '',
      DrawerTitle: '新增分行',
    };
  }

  formRef = React.createRef();
  formRef2 = React.createRef();

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const id = store.getState().PSID;
    let dataSource = [];
    await axios
      .get('/getPawnshop', {
        params: {
          id,
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

    dataSource = dataSource.map((obj, index) => {
      if (obj.PSID === id) {
        const {
          PSID,
          PSName,
          Address,
          RegCapital,
          FoundDate,
          BusinessTerm,
          Representative,
          PermitCode,
          PermitAuthority,
          PermitDate,
          BLicenseAuthority,
          SocCreCode,
          Phone,
          Zip,
          Description,
          IsBranch,
          HeadOfficeID,
          AuditState,
          InfoChange,
          ComMemID,
        } = obj;
        this.setState({
          PSID,
          PSName,
          Address,
          RegCapital,
          FoundDate,
          BusinessTerm,
          Representative,
          PermitCode,
          PermitAuthority,
          PermitDate,
          BLicenseAuthority,
          SocCreCode,
          Phone,
          Zip,
          Description,
          IsBranch,
          HeadOfficeID,
          AuditState,
          InfoChange,
          ComMemID,
        });
      }
      return {
        ...obj,
        key: index,
      };
    });

    if (dataSource.length === 1) {
      const {
        PSID,
        PSName,
        Address,
        RegCapital,
        FoundDate,
        BusinessTerm,
        Representative,
        PermitCode,
        PermitAuthority,
        PermitDate,
        BLicenseAuthority,
        SocCreCode,
        Phone,
        Zip,
        Description,
        IsBranch,
        HeadOfficeID,
        AuditState,
        InfoChange,
        ComMemID,
      } = dataSource[0];
      this.formRef2.current.setFieldsValue({
        PSID,
        PSName,
        Address,
        RegCapital,
        FoundDate: moment(FoundDate),
        BusinessTerm,
        Representative,
        PermitCode,
        PermitAuthority,
        PermitDate: moment(PermitDate),
        BLicenseAuthority,
        SocCreCode,
        Phone,
        Zip,
        Description,
        IsBranch,
        HeadOfficeID: PSName,
        // AuditState,
        // InfoChange,
        // ComMemID
      });
    }

    this.setState({
      dataSource,
      count: dataSource.length,
    });
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

  handleID = (e) => {
    this.setState({
      PSID: e.target.value,
    });
  };

  handleName = (e) => {
    this.setState({
      PSName: e.target.value,
    });
  };

  handleAddress = (e) => {
    this.setState({
      Address: e.target.value,
    });
  };

  handleRegCapital = (e) => {
    this.setState({
      RegCapital: e.target.value,
    });
  };

  handleRepresentative = (e) => {
    this.setState({
      Representative: e.target.value,
    });
  };

  handleFoundDate = (date, dateString) => {
    this.setState({
      FoundDate: dateString,
    });
  };

  handleBusinessTerm = (e) => {
    this.setState({
      BusinessTerm: e.target.value,
    });
  };

  handlePermitCode = (e) => {
    this.setState({
      PermitCode: e.target.value,
    });
  };

  handlePermitDate = (date, dateString) => {
    this.setState({
      PermitDate: dateString,
    });
  };

  handlePermitAuthority = (e) => {
    this.setState({
      PermitAuthority: e.target.value,
    });
  };

  handleBLicenseAuthority = (e) => {
    this.setState({
      BLicenseAuthority: e.target.value,
    });
  };

  handleSocCreCode = (e) => {
    this.setState({
      SocCreCode: e.target.value,
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

  handleIsBranch = (e) => {
    this.setState({
      IsBranch: e,
    });
  };

  handleHeadOfficeID = (e) => {
    this.setState({
      HeadOfficeID: e,
    });
  };

  handleDescription = (e) => {
    this.setState({
      Description: e.target.value,
    });
  };

  showDrawer = () => {
    this.setState({
      DrawerTitle: '新增分行',
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
        PSID: this.state.PSID,
        PSName: this.state.PSName,
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
    const {
      count,
      dataSource,
      PSID,
      PSName,
      Address,
      RegCapital,
      FoundDate,
      BusinessTerm,
      Representative,
      PermitCode,
      PermitAuthority,
      PermitDate,
      BLicenseAuthority,
      SocCreCode,
      Phone,
      Zip,
      Description,
      IsBranch,
      HeadOfficeID,
      AuditState,
      ComMemID,
    } = this.state;
    //PSID,PSName,Address,RegCapital,FoundDate,BusinessTerm,Representative,PermitCode,PermitAuthority,PermitDate,BLicenseAuthority,SocCreCode,Phone,Zip,Description,IsBranch,HeadOfficeID,AuditState,InfoChange,ComMemID)VALUES
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
          <Breadcrumb.Item>内部管理</Breadcrumb.Item>
          <Breadcrumb.Item>当行信息管理</Breadcrumb.Item>
        </Breadcrumb>
        {count > 1 ? (
          <div className="site-layout-background" style={{ padding: 10 }}>
            <Button
              type="primary"
              onClick={this.showDrawer}
              icon={<PlusOutlined />}
              style={{ marginBottom: 16 }}
            >
              新增分行
            </Button>
            <Table
              size="small"
              components={components}
              rowClassName={() => 'editable-row'}
              bordered
              dataSource={dataSource}
              columns={columns}
              pagination={{ pageSize: 5 }}
              onRow={(record) => {
                return {
                  onDoubleClick: (event) => {
                    const {
                      PSID,
                      PSName,
                      Address,
                      RegCapital,
                      FoundDate,
                      BusinessTerm,
                      Representative,
                      PermitCode,
                      PermitAuthority,
                      PermitDate,
                      BLicenseAuthority,
                      SocCreCode,
                      Phone,
                      Zip,
                      Description,
                      IsBranch,
                      HeadOfficeID,
                      AuditState,
                      ComMemID,
                    } = record;
                    this.setState({
                      PSID,
                      PSName,
                      Address,
                      RegCapital,
                      FoundDate,
                      BusinessTerm,
                      Representative,
                      PermitCode,
                      PermitAuthority,
                      PermitDate,
                      BLicenseAuthority,
                      SocCreCode,
                      Phone,
                      Zip,
                      Description,
                      IsBranch,
                      HeadOfficeID,
                      AuditState,
                      ComMemID,
                      DrawerTitle: '编辑当行信息',
                      visible: true,
                    });
                  },
                };
              }}
            />
          </div>
        ) : (
          <Form
            layout="vertical"
            ref={this.formRef2}
            hideRequiredMark
            style={{ overflow: 'auto', height: '72vh', padding: '0 8px' }}
            initialValues={{
              PSID,
              PSName,
              Address,
              RegCapital,
              FoundDate: moment(FoundDate),
              BusinessTerm,
              Representative,
              PermitCode,
              PermitAuthority,
              PermitDate: moment(PermitDate),
              BLicenseAuthority,
              SocCreCode,
              Phone,
              Zip,
              Description,
              IsBranch,
              HeadOfficeID,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PSID"
                  label="当行编号"
                  rules={[{ required: true, message: '请输入当行编号' }]}
                >
                  <Input
                    value={this.state.PSID}
                    placeholder="请输入当行编号"
                    onChange={this.handleID}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PSName"
                  label="当行名称"
                  rules={[{ required: true, message: '请输入当行名称' }]}
                >
                  <Input
                    value={this.state.PSName}
                    placeholder="请输入当行名称"
                    onChange={this.handleName}
                  />
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
                  <Input.TextArea
                    rows={2}
                    value={this.state.Address}
                    onChange={this.handleAddress}
                    placeholder="请输入详细地址"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="RegCapital"
                  label="注册资本"
                  rules={[{ required: true, message: '请输入注册资本' }]}
                >
                  <Input
                    value={this.state.RegCapital}
                    placeholder="请输入注册资本"
                    onChange={this.handleRegCapital}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Representative"
                  label="法定代表人"
                  rules={[{ required: true, message: '请输入法定代表人' }]}
                >
                  <Input
                    value={this.state.Representative}
                    placeholder="请输入法定代表人"
                    onChange={this.handleRepresentative}
                  />
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
                  <DatePicker
                    style={{ width: '100%' }}
                    value={this.state.FoundDate}
                    onChange={this.handleFoundDate}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="BusinessTerm"
                  label="营业期限"
                  rules={[{ required: true, message: '请输入营业期限' }]}
                >
                  <Input
                    value={this.state.BusinessTerm}
                    placeholder="请输入营业期限"
                    onChange={this.handleBusinessTerm}
                  />
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
                  <Input
                    value={this.state.PermitCode}
                    onChange={this.handlePermitCode}
                    placeholder="请输入经营许可证编码"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PermitDate"
                  label="许可证发证日期"
                  rules={[{ required: true, message: '请选择许可证发证日期' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    value={this.state.PermitDate}
                    onChange={this.handlePermitDate}
                  />
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
                  <Input
                    value={this.state.PermitAuthority}
                    onChange={this.handlePermitAuthority}
                    placeholder="请输入许可证批准机关"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="BLicenseAuthority"
                  label="营业执照登记机关"
                  rules={[
                    { required: true, message: '请输入营业执照登记机关' },
                  ]}
                >
                  <Input
                    value={this.state.BLicenseAuthority}
                    onChange={this.handleBLicenseAuthority}
                    placeholder="请输入营业执照登记机关"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="SocCreCode"
                  label="统一社会信用代码"
                  rules={[
                    { required: true, message: '请输入统一社会信用代码' },
                  ]}
                >
                  <Input
                    value={this.state.SocCreCode}
                    onChange={this.handleSocCreCode}
                    placeholder="请输入统一社会信用代码"
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
                  name="Zip"
                  label="邮政编码"
                  rules={[{ required: true, message: '请输入邮政编码' }]}
                >
                  <Input
                    value={this.state.Zip}
                    onChange={this.handleZip}
                    placeholder="请输入邮政编码"
                  />
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
                  <Select
                    value={this.state.IsBranch}
                    onChange={this.handleIsBranch}
                    placeholder="选择是否为分行"
                  >
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
                  <Select
                    value={this.state.HeadOfficeID}
                    onChange={this.handleHeadOfficeID}
                    placeholder="选择所属总行"
                  >
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
              <Col span={24}>
                <Form.Item name="Description" label="简介">
                  <Input.TextArea
                    rows={4}
                    value={this.state.Description}
                    onChange={this.handleDescription}
                    placeholder="请输入简介"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}

        {count > 1 ? (
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
            <Form
              layout="vertical"
              ref={this.formRef}
              hideRequiredMark
              initialValues={{
                PSID,
                PSName,
                Address,
                RegCapital,
                FoundDate: moment(FoundDate),
                BusinessTerm,
                Representative,
                PermitCode,
                PermitAuthority,
                PermitDate: moment(PermitDate),
                BLicenseAuthority,
                SocCreCode,
                Phone,
                Zip,
                Description,
                IsBranch,
                HeadOfficeID,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="PSID"
                    label="当行编号"
                    rules={[{ required: true, message: '请输入当行编号' }]}
                  >
                    <Input
                      value={this.state.PSID}
                      placeholder="请输入当行编号"
                      onChange={this.handleID}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="PSName"
                    label="当行名称"
                    rules={[{ required: true, message: '请输入当行名称' }]}
                  >
                    <Input
                      value={this.state.PSName}
                      placeholder="请输入当行名称"
                      onChange={this.handleName}
                    />
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
                    <Input.TextArea
                      rows={3}
                      value={this.state.Address}
                      onChange={this.handleAddress}
                      placeholder="请输入详细地址"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="RegCapital"
                    label="注册资本"
                    rules={[{ required: true, message: '请输入注册资本' }]}
                  >
                    <Input
                      value={this.state.RegCapital}
                      placeholder="请输入注册资本"
                      onChange={this.handleRegCapital}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="Representative"
                    label="法定代表人"
                    rules={[{ required: true, message: '请输入法定代表人' }]}
                  >
                    <Input
                      value={this.state.Representative}
                      placeholder="请输入法定代表人"
                      onChange={this.handleRepresentative}
                    />
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
                    <DatePicker
                      style={{ width: '100%' }}
                      value={this.state.FoundDate}
                      onChange={this.handleFoundDate}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="BusinessTerm"
                    label="营业期限"
                    rules={[{ required: true, message: '请输入营业期限' }]}
                  >
                    <Input
                      value={this.state.BusinessTerm}
                      placeholder="请输入营业期限"
                      onChange={this.handleBusinessTerm}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="PermitCode"
                    label="经营许可证编码"
                    rules={[
                      { required: true, message: '请输入经营许可证编码' },
                    ]}
                  >
                    <Input
                      value={this.state.PermitCode}
                      onChange={this.handlePermitCode}
                      placeholder="请输入经营许可证编码"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="PermitDate"
                    label="许可证发证日期"
                    rules={[
                      { required: true, message: '请选择许可证发证日期' },
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      value={this.state.PermitDate}
                      onChange={this.handlePermitDate}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="PermitAuthority"
                    label="许可证批准机关"
                    rules={[
                      { required: true, message: '请输入许可证批准机关' },
                    ]}
                  >
                    <Input
                      value={this.state.PermitAuthority}
                      onChange={this.handlePermitAuthority}
                      placeholder="请输入许可证批准机关"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="BLicenseAuthority"
                    label="营业执照登记机关"
                    rules={[
                      { required: true, message: '请输入营业执照登记机关' },
                    ]}
                  >
                    <Input
                      value={this.state.BLicenseAuthority}
                      onChange={this.handleBLicenseAuthority}
                      placeholder="请输入营业执照登记机关"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="SocCreCode"
                    label="统一社会信用代码"
                    rules={[
                      { required: true, message: '请输入统一社会信用代码' },
                    ]}
                  >
                    <Input
                      value={this.state.SocCreCode}
                      onChange={this.handleSocCreCode}
                      placeholder="请输入统一社会信用代码"
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
                    name="Zip"
                    label="邮政编码"
                    rules={[{ required: true, message: '请输入邮政编码' }]}
                  >
                    <Input
                      value={this.state.Zip}
                      onChange={this.handleZip}
                      placeholder="请输入邮政编码"
                    />
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
                    <Select
                      value={this.state.IsBranch}
                      onChange={this.handleIsBranch}
                      placeholder="选择是否为分行"
                    >
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
                    <Select
                      value={this.state.HeadOfficeID}
                      onChange={this.handleHeadOfficeID}
                      placeholder="选择所属总行"
                    >
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
                <Col span={24}>
                  <Form.Item name="Description" label="简介">
                    <Input.TextArea
                      rows={4}
                      value={this.state.Description}
                      onChange={this.handleDescription}
                      placeholder="请输入简介"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Drawer>
        ) : (
          ''
        )}
      </div>
    );
  }
}
