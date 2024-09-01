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
  Tabs,
  Select,
  DatePicker,
  Space,
  Badge,
  notification,
  Modal,
  Tag,
  Cascader,
  Upload,
  message,
} from 'antd';
import axios from 'axios';
import Qs from 'qs';
import store from '../../../../redux/store';
import '../../../../style/common.less';
//import 'antd/dist/antd.css';
import {
  PlusOutlined,
  SmileOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import moment from 'moment';

const { TabPane } = Tabs;

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

export default class AssessResult extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '操作',
        dataIndex: 'operation',
        fixed: 'left',
        width: '90px',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              {record.state === '0' ? (
                <Button size="small">撤单</Button>
              ) : record.state === '1' ? (
                <Button disabled size="small">
                  撤单
                </Button>
              ) : record.state === '2' ? (
                <Button size="small">支付</Button>
              ) : (
                <Button disabled size="small">
                  撤单
                </Button>
              )}
              {/* <Popconfirm title="确认报价吗？" onConfirm={() => this.showModal(record)}>
                 <a>{record.state === "0" ?'撤单':record.state === "1" ?'撤单':0}</a>
             </Popconfirm>
             &nbsp;&nbsp;&nbsp;&nbsp;
             <Popconfirm title="确认删除吗？" onConfirm={() => this.handleDelete(record.ApplyID)}>
                 <a>删除</a>
             </Popconfirm> */}
            </div>
          ) : null,
      },

      {
        title: '当物编号',
        dataIndex: 'PIID',
        fixed: 'left',
        width: '90px',
        fixed: 'left',
      },
      {
        title: '专家姓名',
        dataIndex: 'ExpertName',
        fixed: 'left',
        width: '90px',
      },
      {
        title: '专业技术资格证书编号',
        width: '190px',
        dataIndex: 'TechQCcode',
      },
      {
        title: '研究领域',
        dataIndex: 'ResearchField',
      },
      {
        title: '费用',
        dataIndex: 'AuthenticateFare',
        width: '80px',
      },
      {
        title: '联系电话',
        dataIndex: 'Phone',
        width: '120px',
      },
      {
        title: '邮箱地址',
        dataIndex: 'Email',
        width: '200px',
      },
      {
        title: '微信号',
        dataIndex: 'Wechat',
        width: '100px',
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        fixed: 'right',
        width: '105px',
        filters: [
          { text: '已接单', value: '1' },
          { text: '已完成', value: '2' },
          { text: '已拒单', value: '3' },
          { text: '未接单', value: '0' },
        ],
        render: (_, record) =>
          record.state === '1' ? (
            <Badge color="orange" text="已接单" />
          ) : record.state === '2' ? (
            <Badge color="green" text="已完成" />
          ) : record.state === '0' ? (
            <Badge color="volcano" text="已拒单" />
          ) : (
            <Badge color="blue" text="未接单" />
          ),
      },
    ];

    this.state = {
      previewVisible: false,
      isModalVisible: false,
      isSearch: false,
      visible: false,
      visible_modal: false,
      childrenDrawer: false,
      ChildrenDrawerData: {},
      SpeDetailArr: [],
      DocDetailArr: [],
      SpecificationArr: [],
      SpecificationData: {},
      DocumentsArr: [],
      selectedTags: [],
      dataSource: [],
      dataSource1: [],
      expandedRowKeys: [],
      count: 0,
      TotalPrice: 0,
      TotalExpense: 0,
      flag: 1,

      searchID: '', //查找物品id
    };
  }

  //搜索
  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearch(selectedKeys, confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button
            onClick={() => this.handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            重置
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              this.setState({
                searchText: selectedKeys[0],
                searchedColumn: dataIndex,
              });
            }}
          >
            过滤
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? 'orange' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  componentDidMount() {
    const date = moment(new Date()).add(30, 'days').format('YYYY-MM-DD');
    this.setState({
      date,
      PSID: store.getState().PSID,
    });
    this.getData();
  }

  //获取结果信息
  getData = () => {
    var that = this;
    axios
      .get('/getExpSer', {
        params: {
          type: 'PSgetSer',
          PSID: store.getState().PSID,
        },
      })
      .then((response) => {
        const dataSource = response.data.map((item, index) => {
          return { ...item, key: index };
        });
        const Authenticate = dataSource.filter(
          (item) => item.Authenticate === '1'
        );
        const Assess = dataSource.filter((item) => item.Assess === '1');
        that.setState({ Authenticate, Assess, dataSource: Authenticate });
      });
  };

  //获取物品信息
  getThings = async (TID) => {
    var that = this;
    const things = TID.split(';');
    let dataSource1 = [];
    things.forEach(async (UIID, index) => {
      let obj = {};
      await axios
        .get('/getUserItems', {
          params: {
            UIID,
            type: 'PSgetItem',
          },
        })
        .then((response) => {
          if (response.data.length === 0) {
            console.log('无数据');
          } else {
            obj = response.data[0];
            obj.key = obj.UIID;
            obj.PIID = obj.UIID;
            obj.fileList = obj.photopath.split(';');
            obj.fileList = obj.fileList.map((obj, index) => {
              return {
                url: obj,
                uid: index,
                key: index,
              };
            });
            dataSource1.push(obj);
            if (index === things.length - 1) {
              that.setState({
                dataSource1,
              });
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  };

  //切换Tab
  handleTab = (e) => {
    console.log(e === '1');
    const { Authenticate, Assess } = this.state;
    this.setState({ flag: e, dataSource: e === '1' ? Authenticate : Assess });
  };

  render() {
    const { checkid, previewVisible, previewImage, fileList, previewTitle } =
      this.state;
    const {
      PTID,
      categories,
      isModalVisible,
      expandedRowKeys,
      dataSource,
      dataSource1,
      ChildrenDrawerData,
      SpeDetailArr,
      DocDetailArr,
      SpecificationArr,
      SpecificationData,
      DocumentsArr,
      selectedTags,
      PIID,
      CID,
      UserID,
      UserName,
      Gender,
      Address,
      Phone,
      Email,
      Wechat,
      PSID,
      Specification,
      Documents,
      photopath,
      state,
      PriceOnSale,
      canDistribute,
      title,
      SpeDetail,
      DocDetail,
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

    return (
      <div>
        <Breadcrumb style={{ margin: '10px' }}>
          <Breadcrumb.Item>专家服务</Breadcrumb.Item>
          <Breadcrumb.Item>反馈结果</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: '0 10' }}>
          <Tabs defaultActiveKey="1" type="card" onChange={this.handleTab}>
            <TabPane tab="鉴定结果" key="1">
              <Table
                className="ant-table"
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={dataSource}
                columns={columns}
                pagination={{ pageSize: 10 }}
                size="small"
                scroll={{ x: 1200 }}
                minHeight="600"
              />
            </TabPane>
            <TabPane tab="估价结果" key="2">
              <Table
                className="ant-table"
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={dataSource}
                columns={columns}
                pagination={{ pageSize: 10 }}
                size="small"
                scroll={{ x: 1200 }}
                minHeight="600"
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}
