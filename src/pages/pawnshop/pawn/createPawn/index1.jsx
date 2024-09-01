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
  InputNumber,
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
import { PlusOutlined, SmileOutlined, DownOutlined } from '@ant-design/icons';
import moment from 'moment';

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function trunTree(arr) {
  let newArr = {};
  let aa = [];
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    newArr[element.CID] = {
      ...element,
      value: element.CID,
      label: element.title,
      children: [],
    };
  }
  for (const key in newArr) {
    if (Object.hasOwnProperty.call(newArr, key)) {
      const element = newArr[key];
      if (element.ParentNode == '') {
        aa.push(element);
      } else {
        newArr[element.ParentNode].children.push(element);
      }
    }
  }
  return aa;
}

const { Option } = Select;
const { CheckableTag } = Tag;
const { RangePicker } = DatePicker;

const normFile = (e) => {
  console.log('Upload event:', e);

  if (Array.isArray(e)) {
    return e;
  }

  return e && e.fileList;
};

const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      'selectedRows: ',
      selectedRows
    );
  },
  onSelect: (record, selected, selectedRows) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.log(selected, selectedRows, changeRows);
  },
};

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

export default class CreatePawn extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '当户姓名',
        dataIndex: 'UserName',
        key: 'UserName',
        width: '10%',
      },
      {
        title: '当户证件号',
        dataIndex: 'UserID',
        key: 'UserID',
      },
      {
        title: '联系电话',
        dataIndex: 'Phone',
        key: 'Phone',
      },
      {
        title: '详细住址',
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
      // {
      //   title: '当物数量',
      //   dataIndex: 'Quantity',
      //   key: 'Quantity',
      //   width: '10%'
      // },
      // {
      //   title: '总估价',
      //   dataIndex: 'TotalPrice',
      //   key: 'TotalPrice',
      //   width: '10%'
      // },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '12%',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              <Popconfirm
                title="确认建当吗？"
                onConfirm={() => this.showModal(record)}
              >
                <a>同意</a>
              </Popconfirm>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Popconfirm
                title="拒绝建当吗？"
                onConfirm={() => this.handleDelete(record.key)}
              >
                <a>拒绝</a>
              </Popconfirm>
            </div>
          ) : null,
      },
    ];

    this.state = {
      previewVisible: false,
      isModalVisible: false,
      visible: false,
      visible_modal: false,
      childrenDrawer: false,
      DrawerTitle: '新增当单',
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
      UserID: '',
      UserName: '',
      Gender: '',
      Address: '',
      Phone: '',
      Email: '',
      Wechat: '',
      Notes: '',

      PIID: '',
      CID: '',
      Specification: '',
      Documents: '',
      Quantity: '',
      AssessPrice: '',
      Rate: '',
      Amount: '',
      photopath: '',
      state: '',
      PriceOnSale: '',
      canDistribute: '0',
      title: '',
      SpeDetail: '',
      DocDetail: '',
      categories: [],
      fileList: [],
      previewTitle: '',
      category: '',
      day: 30,
      date: '',

      Interest: 0,
      StoreFare: 0,
      OverdueFare: 0,
      FreightFare: 0,
      AuthenticateFare: 0,
      AssessFare: 0,
      NotaryFare: 0,
      InsuranceFare: 0,
      OtherFare: 0,
      ENotes: '',
    };
  }

  componentDidMount() {
    const date = moment(new Date()).add(30, 'days').format('YYYY-MM-DD');
    this.setState({
      date,
      PSID: store.getState().PSID,
    });
    this.getData();
    this.getCat().then((res) => {
      this.setState({
        categories: trunTree(res),
      });
    });
  }

  //初始化列表
  getData = async () => {
    const { PSID } = store.getState();
    let dataSource = [];
    await axios
      .get('/getPawnItems', {
        params: {
          id: PSID,
          state: 0,
        },
      })
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
  };

  getCat = async () => {
    var that = this;
    let dataSource = [];
    let newArray = [];
    await axios
      .get('/getCategory')
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

    return dataSource;
  };

  formRef = React.createRef();
  formRef2 = React.createRef();
  formRef3 = React.createRef();

  getDetail = async (userid) => {
    const { PSID } = store.getState();
    let dataSource1 = [];
    await axios
      .get('/getPawnItems', {
        params: {
          id: PSID,
          state: 0,
          userid,
        },
      })
      .then((response) => {
        if (response.data.length === 0) {
          console.log('无数据');
        } else {
          dataSource1 = response.data;
        }
      })
      .catch((error) => {
        console.log(error);
      });

    dataSource1 = dataSource1.map((obj, index) => {
      return {
        ...obj,
        key: obj.PIID,
      };
    });
    this.setState({
      dataSource1,
    });
  };

  onExpand = async (expanded, record) => {
    if (expanded) {
      this.setState({ expandedRowKeys: [record.key] });
    } else {
      this.setState({ expandedRowKeys: [] });
    }
    await this.getDetail(record.UserID);
  };
  //PIID,CID,title,Specification,Documents,photopath,canDistribute,SpeDetail,DocDetail
  expandedRowRender = (record) => {
    const columns1 = [
      {
        title: '当品编号',
        dataIndex: 'PIID',
        key: 'PIID',
        editable: false,
        width: '10%',
      },
      {
        title: '当物名称',
        dataIndex: 'title',
        key: 'title',
        width: '10%',
      },
      {
        title: '详情',
        dataIndex: 'Specification',
        key: 'Specification',
        ellipsis: {
          showTitle: false,
        },
        render: (Specification) => (
          <Tooltip placement="topLeft" title={Specification}>
            {Specification}
          </Tooltip>
        ),
      },
      {
        title: '附件',
        dataIndex: 'Documents',
        key: 'Documents',
      },
      {
        title: '估价',
        dataIndex: 'UnitPrice',
        key: 'UnitPrice',
        width: '10%',
      },
      {
        title: '单位',
        dataIndex: 'Quantity',
        key: 'Quantity',
        width: '10%',
      },
      {
        title: 'Action',
        dataIndex: 'operation',
        key: 'operation',
        width: '13%',
        render: (_, record) => (
          <Space size={3}>
            <Button
              type="link"
              style={{ padding: '0 6px' }}
              onClick={() => {
                this.handleEditDetail(record);
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              style={{ padding: '0 6px' }}
              onClick={() => {
                this.handleEditDetail(record);
              }}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ];
    console.log(this.state.dataSource1);

    return (
      <Table
        columns={columns1}
        dataSource={this.state.dataSource1}
        pagination={false}
      />
    );
  };

  handleEditDetail = (data, record) => {
    console.log(record);
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

  handleUserName = (e) => {
    this.setState({
      UserName: e.target.value,
    });
  };

  handleUserID = (e) => {
    this.setState({
      UserID: e.target.value,
    });
  };

  searchUserInfo = (e) => {
    var that = this;
    axios
      .get('/getUsers', {
        params: {
          UserID: e.target.value,
        },
      })
      .then((response) => {
        if (response.data.length === 0) {
          message.warning('该用户未注册，确认建当后将为用户开设账户');
          this.setState({
            UserName: '',
            Phone: '',
            Address: '',
          });
          setTimeout(() => {
            that.formRef.current.setFieldsValue({
              UserName: '',
              Phone: '',
              Address: '',
            });
          }, 200);
        } else {
          const { UserName, Phone, Address } = response.data[0];
          this.setState({
            UserName,
            Phone,
            Address,
          });
          setTimeout(() => {
            that.formRef.current.setFieldsValue({
              UserName,
              Phone,
              Address,
            });
          }, 200);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleGender = (e) => {
    this.setState({
      Gender: e,
    });
  };

  handlePhone = (e) => {
    this.setState({
      Phone: e.target.value,
    });
  };

  handleDate = (e) => {
    this.setState({
      day: e,
      date: moment(new Date()).add(e, 'days').format('YYYY-MM-DD'),
    });
  };

  handleWechat = (e) => {
    this.setState({
      Wechat: e.target.value,
    });
  };

  handleEmail = (e) => {
    this.setState({
      Email: e.target.value,
    });
  };

  handleAddress = (e) => {
    this.setState({
      Address: e.target.value,
    });
  };

  handleAssessPrice = (e) => {
    const { Rate } = this.state;

    if (Rate != '') {
      this.setState({
        Amount: e.target.value * 1.0 * Rate * 0.01,
        AssessPrice: e.target.value,
      });
      setTimeout(() => {
        this.formRef2.current.setFieldsValue({
          Amount: e.target.value * 1.0 * Rate * 0.01,
        });
      }, 200);
    } else {
      this.setState({ AssessPrice: e.target.value });
    }
  };

  handleRate = (e) => {
    const { AssessPrice } = this.state;

    if (AssessPrice != '') {
      this.setState({
        Amount: e.target.value * 1.0 * AssessPrice * 0.01,
        Rate: e.target.value,
      });
      setTimeout(() => {
        this.formRef2.current.setFieldsValue({
          Amount: e.target.value * 1.0 * AssessPrice * 0.01,
        });
      }, 200);
    } else {
      this.setState({ Rate: e.target.value });
    }
  };

  handleTagsChange(tag, checked) {
    const { selectedTags } = this.state;
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    const Documents = nextSelectedTags.join(';');
    this.setState({ Documents, selectedTags: nextSelectedTags });
  }

  handleFare = () => {
    setTimeout(() => {
      const {
        Interest,
        StoreFare,
        OverdueFare,
        FreightFare,
        AuthenticateFare,
        AssessFare,
        NotaryFare,
        InsuranceFare,
        OtherFare,
      } = this.state;
      const TotalExpense =
        Interest +
        StoreFare +
        OverdueFare +
        FreightFare +
        AuthenticateFare +
        AssessFare +
        NotaryFare +
        InsuranceFare +
        OtherFare;
      this.setState({ TotalExpense });
    }, 600);
  };

  setPTID = () => {
    var that = this;
    axios
      .get('/createPawn', {
        params: {
          step: 0,
          PSID: store.getState().PSID,
        },
      })
      .then((response) => {
        if (response.data.length === 0) {
          console.log('无数据');
        } else {
          that.setState({ PTID: response.data[0].PTID });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  showDrawer = () => {
    this.setPTID();
    this.setState({
      visible: true,
      DrawerTitle: '新增当单',
      TotalPrice: 0,
      Quantity: '',
      dataSource1: [],
      fileList: [],
      TotalExpense: 0,
      Interest: 0,
      StoreFare: 0,
      OverdueFare: 0,
      FreightFare: 0,
      AuthenticateFare: 0,
      AssessFare: 0,
      NotaryFare: 0,
      InsuranceFare: 0,
      OtherFare: 0,
    });
    setTimeout(() => {
      this.formRef.current.resetFields();
      this.formRef.current.setFieldsValue({
        PTID: this.state.PTID,
      });
    }, 200);
  };

  onClose = () => {
    this.setState({
      visible: false,
      PIID: '',
      CID: '',
      UserID: '',
      UserName: '',
      Address: '',
      Phone: '',
      Email: '',
      Wechat: '',
      PSID: '',
      Specification: '',
      Documents: '',
      photopath: '',
      state: '',
      PriceOnSale: '',
      canDistribute: '',
      title: '',
      SpeDetail: '',
      DocDetail: '',
      dataSource1: [],
    });
  };

  onSubmit = () => {
    const { UserID, UserName, Phone, Address, dataSource1 } = this.state;
    const BirthDate =
      UserID.substring(6, 10) +
      '-' +
      UserID.substring(10, 12) +
      '-' +
      UserID.substring(12, 14);

    let data = {
      step: 1,
      UserID,
      UserName,
      Phone,
      Address,
      BirthDate,
    };

    axios({
      method: 'post',
      url: 'http://localhost:3000/createPawn',
      data: Qs.stringify(data),
    })
      .then(this.onSubmit2())
      .then(this.onSubmit3())
      .then(this.onSubmit4());

    // this.getData()

    // notification.open({
    //   message: 'Notification',
    //   description:
    //     <div style={{whiteSpace: 'pre-wrap'}}>已成功添加人员<br/>初始密码为123456</div>,
    //   icon: <SmileOutlined style={{color:'orange'}}/>,
    //   duration: 2
    // });
    this.onClose();
  };

  onSubmit2 = () => {
    const { PSID, UserID, UserName, Phone, Address, dataSource1 } = this.state;
    const BirthDate =
      UserID.substring(6, 10) +
      '-' +
      UserID.substring(10, 12) +
      '-' +
      UserID.substring(12, 14);

    dataSource1.forEach(async (item) => {
      const {
        PIID,
        CID,
        Specification,
        Documents,
        photopath,
        Quantity,
        canDistribute,
      } = item;

      let data = {
        step: 2,
        PIID,
        CID,
        UserID,
        PSID,
        Specification,
        Documents,
        photopath,
        Quantity,
        canDistribute,
      };

      await axios({
        method: 'post',
        url: 'http://localhost:3000/createPawn',
        data: Qs.stringify(data),
      });
    });
  };

  onSubmit3 = async () => {
    const PSstaffID = store.getState().PSstaffID;
    const StartDate = moment(new Date()).format('YYYY-MM-DD');
    const { PTID, PSID, UserID, date, dataSource1, ENotes } = this.state;
    let data = {
      step: 3,
      PTID,
      UserID,
      PSID,
      StartDate,
      EndDate: date,
      EID: PTID,
      PSstaffID,
      Notes: ENotes,
    };

    await axios({
      method: 'post',
      url: 'http://localhost:3000/createPawn',
      data: Qs.stringify(data),
    });

    dataSource1.forEach(async (item) => {
      const { PIID, AssessPrice, Rate, Amount } = item;

      let data = {
        step: 4,
        PTID,
        PIID,
        AssessPrice,
        Rate,
        Amount,
      };

      await axios({
        method: 'post',
        url: 'http://localhost:3000/createPawn',
        data: Qs.stringify(data),
      });
    });
  };

  onSubmit4 = async () => {
    const PSstaffID = store.getState().PSstaffID;
    const {
      PTID,
      ENotes,
      TotalExpense,
      Interest,
      StoreFare,
      OverdueFare,
      FreightFare,
      AuthenticateFare,
      AssessFare,
      NotaryFare,
      InsuranceFare,
      OtherFare,
    } = this.state;
    let data = {
      step: 5,
      PSstaffID,
      PTID,
      ENotes,
      TotalExpense,
      Interest,
      StoreFare,
      OverdueFare,
      FreightFare,
      AuthenticateFare,
      AssessFare,
      NotaryFare,
      InsuranceFare,
      OtherFare,
    };

    await axios({
      method: 'post',
      url: 'http://localhost:3000/createPawn',
      data: Qs.stringify(data),
    });
  };

  showChildrenDrawer = (key) => {
    if (key === 'add') {
      var timestamp = new Date().getTime();
      var rn = Math.round(Math.random() * 999);
      var PIID = timestamp + '' + rn;
      this.setState({
        PIID,
        childrenDrawer: true,
        ChildrenDrawerData: [],
        SpeDetailArr: [],
        DocDetailArr: [],
        SpecificationArr: [],
        DocumentsArr: [],
        SpecificationData: [],
        selectedTags: [],
      });
      setTimeout(() => {
        this.formRef2.current.setFieldsValue({
          PIID,
        });
      }, 200);
      return;
    } else {
      let selectedTags = [];
      const ChildrenDrawerData = this.state.dataSource1.find(function (obj) {
        return obj.key === key;
      });
      //console.log(ChildrenDrawerData)
      const {
        fileList,
        SpeDetail,
        Specification,
        DocDetail,
        Documents,
        PIID,
        CID,
        category,
        Quantity,
        AssessPrice,
        Rate,
        Amount,
        canDistribute,
      } = ChildrenDrawerData;
      const SpeDetailArr = SpeDetail.split(';');
      const SpecificationArr = Specification.split(';');
      let SpecificationData = {};
      SpeDetailArr.map((obj) => {
        SpecificationArr.map((obj1) => {
          obj1 = obj1.split(':');
          if (obj1[0] === obj) {
            SpecificationData[obj] = obj1[1];
          }
        });
      });
      const DocDetailArr = DocDetail.split(';');
      const DocumentsArr = Documents.split(';');
      selectedTags = DocumentsArr;
      this.setState({
        PIID,
        Quantity,
        AssessPrice,
        Rate,
        Amount,
        canDistribute,
        CID,
        ChildrenDrawerData,
        SpeDetailArr,
        DocDetailArr,
        SpecificationArr,
        DocumentsArr,
        SpecificationData,
        selectedTags,
        category,
        fileList,
        childrenDrawer: true,
      });
      //console.log(category)
      setTimeout(() => {
        this.formRef2.current.setFieldsValue({
          PIID,
          Quantity,
          AssessPrice,
          Rate,
          Amount,
          canDistribute,
          CID: category,
        });
      }, 200);
    }
  };

  showModal = (record) => {
    this.setPTID();
    const {
      UserID,
      UserName,
      Gender,
      Address,
      Phone,
      Email,
      Wechat,
      state,
      TotalPrice,
      Quantity,
    } = record;
    this.getDetail(UserID);
    this.setState({
      UserID,
      UserName,
      Gender,
      Address,
      Phone,
      Email,
      Wechat,
      state,
      TotalPrice,
      Quantity,
      visible_modal: true,
      Interest: 0,
      StoreFare: 0,
      OverdueFare: 0,
      FreightFare: 0,
      AuthenticateFare: 0,
      AssessFare: 0,
      NotaryFare: 0,
      InsuranceFare: 0,
      OtherFare: 0,
      TotalExpense: 0,
    });
    setTimeout(() => {
      this.formRef3.current.resetFields();
      this.formRef3.current.setFieldsValue({
        PTID: this.state.PTID,
      });
    }, 200);
  };

  showEditModal = () => {
    this.setState({ isModalVisible: true });
  };

  handleOk = () => {
    this.setState({ isModalVisible: true });
  };

  // handleCancel = () => {
  //   this.setState({isModalVisible:true,dataSource1:[]})
  // };

  handleCateory = (value, selectedOptions) => {
    //const  text = selectedOptions.map(o => o.label).join(', ');
    //console.log(selectedOptions);
    const CID = value[value.length - 1];
    const { title } = selectedOptions[value.length - 1];

    const { SpeDetail, DocDetail } = selectedOptions[value.length - 1];

    const SpeDetailArr = SpeDetail.split(';');
    const DocDetailArr = DocDetail.split(';');

    let SpecificationData = {};
    SpeDetailArr.forEach((obj) => {
      SpecificationData[obj] = '';
    });

    this.setState({
      CID,
      title,
      ChildrenDrawerData: [],
      SpecificationArr: [],
      DocumentsArr: [],
      selectedTags: [],
      SpecificationData,
      SpeDetailArr,
      DocDetailArr,
      SpeDetail,
      DocDetail,
      childrenDrawer: true,
      category: value,
    });
  };

  displayRender = (label) => {
    return label[label.length - 1];
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle:
        file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  handleImgChange = ({ file, fileList }) => {
    if (file.status === 'done') {
      const newList = fileList.map((v) => {
        if (v.uid === file.uid) {
          v.url =
            'http://localhost:8080/filepath/item/' + file.response.targetfile;
        }
        return v;
      });
      this.setState({
        photopath: newList[0].url,
      });
      console.log(this.state.photopath);
      message.success('上传图片成功');
    } else if (file.status === 'removed') {
      // const result = await reqDeleteImg(file.name)
      message.success('删除图片成功！');
    } else if (file.status === 'error') {
      message.error('图片编辑失败！');
    } else {
    }
    this.setState({ fileList });
  };

  handleSpecification = (obj, e) => {
    // console.log(obj,e.target.value)
    const { SpecificationData } = this.state;
    SpecificationData[obj] = e.target.value;
    this.setState({ SpecificationData });
  };

  //保存当物
  saveItem = () => {
    const {
      TotalPrice,
      category,
      fileList,
      dataSource1,
      SpeDetail,
      DocDetail,
      PIID,
      CID,
      title,
      SpecificationData,
      selectedTags,
      Quantity,
      AssessPrice,
      Rate,
      Amount,
      photopath,
      canDistribute,
    } = this.state;
    let str = '';
    for (var item in SpecificationData) {
      if (SpecificationData[item] != '') {
        str = str + item + ':' + SpecificationData[item] + ';';
      }
    }
    if (str !== '') {
      str = str.substring(0, str.length - 1);
    }
    const pawnitem = {
      PIID,
      CID,
      title,
      Specification: str,
      Documents: selectedTags.join(';'),
      Quantity,
      AssessPrice,
      Rate,
      Amount,
      photopath,
      canDistribute,
      SpeDetail,
      DocDetail,
      fileList,
      category,
      state: 1,
      key: PIID,
    };
    dataSource1.push(pawnitem);

    this.setState({
      dataSource1,
      TotalPrice: TotalPrice + 1 * Amount,
    });

    this.closeChildDrawer();

    //console.log(dataSource1)
  };

  //删除当物
  deleteItem = () => {
    const { Amount, TotalPrice, dataSource1, PIID } = this.state;
    this.setState({
      dataSource1: dataSource1.filter((item) => item.PIID !== PIID),
      TotalPrice: TotalPrice - 1 * Amount,
    });
    this.closeChildDrawer();
  };

  closeChildDrawer = () => {
    setTimeout(() => {
      this.formRef2.current.resetFields();
    }, 200);
    this.setState({
      childrenDrawer: false,
      PIID: '',
      CID: '',
      Specification: '',
      Documents: '',
      Quantity: '',
      AssessPrice: '',
      Rate: '',
      Amount: '',
      photopath: '',
      canDistribute: '',
      title: '',
      fileList: [],
      SpeDetail: '',
      DocDetail: '',
      category: '',
    });
  };

  render() {
    const { previewVisible, previewImage, fileList, previewTitle } = this.state;
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

    const expandedRowRender = this.expandedRowRender;

    const uploadButton = (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    );

    return (
      <div>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>典当管理</Breadcrumb.Item>
          <Breadcrumb.Item>建当管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Button
            type="primary"
            onClick={this.showDrawer}
            icon={<PlusOutlined />}
            style={{ marginBottom: 16 }}
          >
            建当
          </Button>
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
            onExpand={(expanded, record) => {
              this.onExpand(expanded, record);
            }}
            expandable={{ expandedRowRender }}
            expandedRowKeys={expandedRowKeys}
            onRow={(record) => {
              return {
                onDoubleClick: (event) => {
                  const {
                    UserID,
                    UserName,
                    Gender,
                    Address,
                    Phone,
                    Email,
                    Wechat,
                    state,
                    TotalPrice,
                    Quantity,
                  } = record;
                  this.getDetail(UserID);
                  this.setState({
                    UserID,
                    UserName,
                    Gender,
                    Address,
                    Phone,
                    Email,
                    Wechat,
                    state,
                    TotalPrice,
                    Quantity,
                    DrawerTitle: '编辑当单',
                    visible: true,
                  });
                  setTimeout(() => {
                    this.formRef.current.setFieldsValue({
                      UserID,
                      UserName,
                      Address,
                      Phone,
                    });
                  }, 200);
                },
              };
            }}
          />
        </div>
        <Drawer
          title={this.state.DrawerTitle}
          width={820}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
          extra={
            <Space>
              <Button onClick={this.onClose}>取消</Button>
              <Button onClick={this.onSubmit} type="primary">
                确定
              </Button>
            </Space>
          }
        >
          <Form
            layout="vertical"
            ref={this.formRef}
            hideRequiredMark
            initialValues={{
              UserID,
              UserName,
              Gender,
              Address,
              Phone,
              Email,
              Wechat,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="PTID" label="当票编号">
                  <Input disabled onChange={this.handlePTID} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="day"
                  label="典当期限"
                  rules={[{ required: true, message: '请选择典当期限' }]}
                >
                  由&nbsp;&nbsp;{moment(new Date()).format('YYYY-MM-DD')}
                  &nbsp;&nbsp;起共
                  <InputNumber
                    status="warning"
                    style={{ border: '1px solid orange', margin: '0 10px' }}
                    min={1}
                    max={100}
                    defaultValue={30}
                    onChange={this.handleDate}
                  />
                  天至&nbsp;&nbsp;{this.state.date}&nbsp;&nbsp;止
                </Form.Item>
              </Col>
            </Row>
            <hr />
            <p style={{ margin: 0, minHeight: '30px' }}>当户信息</p>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="UserID"
                  label="当户证件号"
                  rules={[{ required: true, message: '请输入当户证件号' }]}
                >
                  <Input
                    placeholder="请输入当户证件号"
                    onChange={this.handleUserID}
                    onPressEnter={this.searchUserInfo}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="UserName"
                  label="当户姓名"
                  rules={[{ required: true, message: '请输入当户姓名' }]}
                >
                  <Input
                    placeholder="请输入当户姓名"
                    onChange={this.handleUserName}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
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
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Address"
                  label="详细住址"
                  rules={[{ required: true, message: '请输入详细住址' }]}
                >
                  <Input.TextArea
                    rows={2}
                    value={this.state.Address}
                    onChange={this.handleAddress}
                    placeholder="请输入详细住址"
                  />
                </Form.Item>
              </Col>
            </Row>
            <hr />
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="detail" label="当单详情">
                  <p style={{ margin: 0, minHeight: 0 }}>
                    当物份数 : {this.state.dataSource1.length}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;总估价 :{' '}
                    {this.state.TotalPrice}
                  </p>
                </Form.Item>
              </Col>
            </Row>
            <Button
              type="primary"
              onClick={() => {
                this.showChildrenDrawer('add');
              }}
            >
              新增当物
            </Button>
            {dataSource1.map((obj, index) => {
              const { PIID, title, Amount, Quantity, key } = obj;
              return (
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item name={key} label={index + 1 * 1}>
                      <Space size={6} align="baseline">
                        <p>
                          当物编号 : {PIID}
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当物名称 : {title}
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当价 : {Amount}
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数量 : {Quantity}
                        </p>
                        <Button
                          type="link"
                          onClick={() => {
                            this.showChildrenDrawer(key);
                          }}
                        >
                          编辑
                        </Button>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              );
            })}
            <hr />
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="expense" label="费用详情">
                  <p style={{ margin: 0, minHeight: 0 }}>
                    费用合计 : {this.state.TotalExpense}
                  </p>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="Interest" label="利&nbsp;&nbsp;&nbsp;&nbsp;息">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ Interest: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="StoreFare" label="仓管费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ StoreFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="OverdueFare" label="逾期费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ OverdueFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="FreightFare" label="物流费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ FreightFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="AuthenticateFare" label="鉴定费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ AuthenticateFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="AssessFare" label="估价费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ AssessFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="NotaryFare" label="公证费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ NotaryFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="InsuranceFare" label="保险费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ InsuranceFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="OtherFare" label="其他费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ OtherFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="ENotes" label="费用备注">
                  <Input.TextArea
                    rows={2}
                    value={this.state.ENotes}
                    onChange={(e) => this.setState({ ENotes: e.target.value })}
                    placeholder="请输入费用备注"
                  />
                </Form.Item>
              </Col>
            </Row>
            <hr />
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="payment" label="实付金额">
                  <p
                    style={{
                      margin: 0,
                      minHeight: 0,
                      color: 'orange',
                      fontSize: '26px',
                    }}
                  >
                    {this.state.TotalPrice - this.state.TotalExpense}
                  </p>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="Notes" label="备注">
                  <Input.TextArea
                    rows={2}
                    value={this.state.Notes}
                    onChange={(e) => this.setState({ Notes: e.target.value })}
                    placeholder="请输入备注内容"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Drawer
            title="当物详情"
            width={360}
            closable
            onClose={this.closeChildDrawer}
            visible={this.state.childrenDrawer}
            extra={
              <Space size="middle">
                <Button onClick={this.deleteItem}>删除</Button>
                <Button type="primary" onClick={this.saveItem}>
                  保存
                </Button>
              </Space>
            }
          >
            <Form
              layout="vertical"
              ref={this.formRef2}
              hideRequiredMark
              initialValues={{
                PIID,
                ...SpecificationData,
                Documents: selectedTags,
                canDistribute: '0',
              }}
            >
              <Form.Item
                name="PIID"
                label="当品编号"
                rules={[{ required: true, message: '请输入当品编号' }]}
              >
                <Input disabled />
              </Form.Item>
              <Form.Item
                name="CID"
                label="当物名称"
                rules={[{ required: true, message: '请选择当物名称' }]}
              >
                <Cascader
                  options={categories}
                  expandTrigger="hover"
                  displayRender={this.displayRender}
                  onChange={this.handleCateory}
                  value={this.state.category}
                />
              </Form.Item>
              <p>物品详情</p>
              {SpeDetailArr.map((obj, index) => {
                let value = '';
                SpecificationArr.map((obj1) => {
                  obj1 = obj1.split(':');
                  if (obj1[0] === obj) {
                    value = obj1[1];
                  }
                });
                return (
                  <Form.Item
                    label={obj}
                    rules={[{ required: true, message: '请输入' + obj }]}
                    value={value}
                  >
                    <Input
                      value={value}
                      placeholder={'请输入' + obj}
                      onChange={(e) => this.handleSpecification(obj, e)}
                    />
                  </Form.Item>
                );
              })}
              <Form.Item
                name="Documents"
                label="附件"
                rules={[{ required: true, message: '请选择可提供附件' }]}
              >
                <div>
                  {DocDetailArr.map((obj, index) => {
                    return (
                      <CheckableTag
                        key={obj}
                        checked={selectedTags.indexOf(obj) > -1}
                        onChange={(checked) =>
                          this.handleTagsChange(obj, checked)
                        }
                      >
                        {obj}
                      </CheckableTag>
                    );
                  })}
                </div>
              </Form.Item>
              <Form.Item
                name="Quantity"
                label="数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <Input
                  placeholder="请输入数量"
                  onChange={(e) => this.setState({ Quantity: e.target.value })}
                />
              </Form.Item>
              <Form.Item
                name="AssessPrice"
                label="估价"
                rules={[{ required: true, message: '请输入估价' }]}
              >
                <Input
                  placeholder="请输入估价"
                  onChange={this.handleAssessPrice}
                />
              </Form.Item>
              <Form.Item
                name="Rate"
                label="折当率%"
                rules={[{ required: true, message: '请输入折当率，如100.00' }]}
              >
                <Input
                  placeholder="请输入折当率，如100.00"
                  onChange={this.handleRate}
                />
              </Form.Item>
              <Form.Item name="Amount" label="典当金额">
                <Input
                  disabled
                  placeholder="请输入估价与折当率"
                  onChange={(e) => this.setState({ Amount: e.target.value })}
                />
              </Form.Item>
              <Form.Item
                label="上传物品照片"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  action="http://localhost:3000/upload?type=item"
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={this.handlePreview}
                  onChange={this.handleImgChange}
                >
                  {fileList.length >= 1 ? null : uploadButton}
                </Upload>
                <Modal
                  visible={previewVisible}
                  title={previewTitle}
                  footer={null}
                  onCancel={this.handleCancel}
                >
                  <img
                    alt="example"
                    style={{ width: '100%' }}
                    src={previewImage}
                  />
                </Modal>
              </Form.Item>
              <Form.Item
                name="canDistribute"
                label="支持邮寄"
                rules={[{ required: true, message: '请选择是否支持邮寄' }]}
              >
                <Select
                  value={this.state.canDistribute}
                  onChange={(e) => this.setState({ canDistribute: e })}
                  placeholder="请选择是否支持邮寄"
                >
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              </Form.Item>
            </Form>
          </Drawer>
        </Drawer>
        <Modal
          title="费用单"
          centered
          visible={this.state.visible_modal}
          onOk={() => {
            this.setState({ visible_modal: false });
          }}
          onCancel={() => {
            this.setState({ visible_modal: false });
          }}
          width={600}
        >
          <Form
            ref={this.formRef3}
            hideRequiredMark
            initialValues={{
              PTID,
              UserID,
              UserName,
              Gender,
              Address,
              Phone,
              Email,
              Wechat,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="PTID" label="当票编号">
                  <Input disabled onChange={this.handlePTID} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="detail" label="当单详情">
                  <p style={{ margin: '0 auto', color: 'orange' }}>
                    &nbsp;&nbsp;当物数量 : {this.state.Quantity}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;总估价 :{' '}
                    {this.state.TotalPrice}
                  </p>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <p>费用单详情</p>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="Interest" label="利&nbsp;&nbsp;&nbsp;&nbsp;息">
                  <InputNumber
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ Interest: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="StoreFare" label="仓管费">
                  <InputNumber
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ StoreFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="OverdueFare" label="逾期费">
                  <InputNumber
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ OverdueFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="FreightFare" label="物流费">
                  <InputNumber
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ FreightFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="AuthenticateFare" label="鉴定费">
                  <InputNumber
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ AuthenticateFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="AssessFare" label="估价费">
                  <InputNumber
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ AssessFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="NotaryFare" label="公证费">
                  <InputNumber
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ NotaryFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="InsuranceFare" label="保险费">
                  <InputNumber
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ InsuranceFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="OtherFare" label="其他费">
                  <InputNumber
                    prefix="￥"
                    defaultValue="0"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ OtherFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="ENotes" label="费用备注">
                  <Input.TextArea
                    rows={2}
                    value={this.state.ENotes}
                    onChange={this.handleENotes}
                    placeholder="请输入费用备注"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
        {/* <Modal title="建当处理" width={800} visible={isModalVisible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form ref={this.formRef2} hideRequiredMark
          initialValues={{UserID,UserName,Gender,Address,Phone,Email,Wechat}}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PTID"
                  label="当票编号"
                  rules={[{ required: true, message: '请输入当票编号' }]}
                >
                  <Input placeholder="请输入当票编号" onChange={this.handlePTID} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PawnDate"
                  label="建当日期"
                  rules={[{ required: true, message: '请选择典当期限' }]}
                >
                  <RangePicker style={{width:'100%'}} disabledDate={(current)=>{return current && current <moment().subtract(1, "days")}} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="UserName"
                  label="当户姓名"
                  rules={[{ required: true, message: '请输入当户姓名' }]}
                >
                  <Input placeholder="请输入当户姓名" onChange={this.handleUserName} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="UserID"
                  label="当户证件号"
                  rules={[{ required: true, message: '请输入当户证件号' }]}
                >
                  <Input placeholder="请输入当户证件号" onChange={this.handleUserID} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="detail"
                  label="当单详情"
                >
                  <p style={{margin:'0 auto', color:'orange'}}>&nbsp;&nbsp;当物数量 : {this.state.Quantity}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;总估价 : {this.state.TotalPrice}</p>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Notes"
                  label="当单标注"
                >
                  <Input.TextArea rows={2} value={this.state.Notes} onChange={this.handleNotes} placeholder="请输入当单标注内容" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <p>费用单详情</p>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="Interest"
                  label="利&nbsp;&nbsp;&nbsp;&nbsp;息"
                >
                  <InputNumber prefix="￥" defaultValue="0" min="0" step="1.00" onChange={this.handleInterest}/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="StoreFare"
                  label="仓管费"
                >
                  <InputNumber prefix="￥" defaultValue="0" min="0" step="1.00" onChange={this.handleStoreFare}/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="OverdueFare"
                  label="逾期费"
                >
                  <InputNumber prefix="￥" defaultValue="0" min="0" step="1.00" onChange={this.handleOverdueFare}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="FreightFare"
                  label="物流费"
                >
                  <InputNumber prefix="￥" defaultValue="0" min="0" step="1.00" onChange={this.handleFreightFare}/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="AuthenticateFare"
                  label="鉴定费"
                >
                  <Input onChange={this.handleAuthenticateFare} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="AssessFare"
                  label="估价费"
                >
                  <Input onChange={this.handleAssessFare} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="NotaryFare"
                  label="公证费"
                >
                  <Input onChange={this.handleNotaryFare} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="InsuranceFare"
                  label="保险费"
                >
                  <Input onChange={this.handleInsuranceFare} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="OtherFare"
                  label="其他费"
                >
                  <Input onChange={this.handleOtherFare} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="ENotes"
                  label="费用备注"
                >
                  <Input.TextArea rows={2} value={this.state.ENotes} onChange={this.handleENotes} placeholder="请输入费用备注" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal> */}
      </div>
    );
  }
}
