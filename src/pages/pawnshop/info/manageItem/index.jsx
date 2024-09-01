import React, {
  Component,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  Breadcrumb,
  Layout,
  Tree,
  Input,
  Table,
  Tabs,
  Card,
  Pagination,
  notification,
  message,
  Form,
  Drawer,
  Space,
  Button,
  Tag,
  Modal,
  Upload,
  Badge,
} from 'antd';
import axios from 'axios';
import Qs from 'qs';
import store from '../../../../redux/store';
import '../../../../style/common.less';
import '../../../../style/FlipCard.less';
//import 'antd/dist/antd.css';
import {
  DownOutlined,
  PlusOutlined,
  SearchOutlined,
  CheckOutlined,
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { CheckableTag } = Tag;
const { TabPane } = Tabs;

const gridStyle = {
  width: '25%',
  height: '240px',
  //textAlign: 'center',
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

const normFile = (e) => {
  console.log('Upload event:', e);

  if (Array.isArray(e)) {
    return e;
  }

  return e && e.fileList;
};

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export default class ManageItem extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '当品编号',
        dataIndex: 'PIID',
        key: 'PIID',
        editable: false,
        width: '150px',
        fixed: 'left',
        ...this.getColumnSearchProps('PIID', '当品编号'),
      },
      {
        title: '当品名称',
        dataIndex: 'itemName',
        key: 'itemName',
        width: '160px',
        fixed: 'left',
        ...this.getColumnSearchProps('itemName', '当品名称'),
      },
      {
        title: '当品类别',
        dataIndex: 'title',
        key: 'title',
        width: '120px',
      },
      {
        title: '当价',
        dataIndex: 'UnitPrice',
        key: 'UnitPrice',
        width: '120px',
      },
      {
        title: '数量',
        dataIndex: 'Quantity',
        key: 'Quantity',
        width: '100px',
      },
      {
        title: '售价',
        dataIndex: 'PriceOnSale',
        key: 'PriceOnSale',
        width: '120px',
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        width: '90px',
        filters: [
          { text: '未在当', value: '0' },
          { text: '在当', value: '1' },
          { text: '绝当', value: '2' },
          { text: '在售', value: '3' },
          { text: '售出', value: '4' },
        ],
        onFilter: (value, record) => record.state === value,
        render: (_, record) =>
          record.state === '0' ? (
            <Badge color="blue" text="未在当" />
          ) : record.state === '1' ? (
            <Badge color="green" text="在当" />
          ) : record.state === '2' ? (
            <Badge color="volcano" text="绝当" />
          ) : record.state === '3' ? (
            <span>在售</span>
          ) : (
            <span>售出</span>
          ),
      },
    ];

    this.state = {
      visible: false,
      TreeData: [],
      count: 0,
      flag: false,
      dataSource: [],
      dataSource2: [],

      selectedNode: '',
      Rate: '',
      Notes: '',

      previewVisible: false,
      SpeDetailArr: [],
      DocDetailArr: [],
      SpecificationArr: [],
      SpecificationData: {},
      DocumentsArr: [],
      selectedTags: [],
      PIID: '',
      itemName: '',
      title: '',
      SpeDetail: '',
      DocDetail: '',
      Specification: '',
      Documents: '',
      photopath: '',
      UnitPrice: '',
      Quantity: '',
      PriceOnSale: '',
      canDistribute: '',
      state: '',
      Discript: '',
      fileList: [],
      previewTitle: '',

      //卡片
      items: [],
      total: 0,
      pageno: 1,
      pagesize: 8,
    };
  }

  //搜索
  getColumnSearchProps = (dataIndex, name) => ({
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
          placeholder={`搜索 ${name}`}
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
            style={{ width: 70 }}
          >
            搜索
          </Button>
          <Button
            onClick={() => this.handleReset(clearFilters)}
            size="small"
            style={{ width: 70 }}
          >
            重置
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

  componentDidMount() {
    this.getData(); //树数据
    this.getItemData('C'); //表格数据
    this.getCard(''); //卡片数据
  }

  formRef = React.createRef();

  //树数据
  getData = async () => {
    let TreeData = [];

    await axios
      .get('/getCategory', {
        params: {
          level: 1,
        },
      })
      .then((response) => {
        if (response.data.length === 0) {
          console.log('无数据');
        } else {
          TreeData = response.data;
        }
      })
      .catch((error) => {
        console.log(error);
      });

    TreeData = TreeData.map((obj, index) => {
      return {
        ...obj,
        key: obj.CID,
        isLeaf: obj.isLeafNode === '0' ? false : true,
      };
    });

    this.setState({
      TreeData,
      count: TreeData.length,
    });
  };

  //切换tab
  handleTab = (e) => {
    if (e === 'tab1') {
    } else {
      // this.getCard(0,1,8);
    }
  };

  //获取卡片信息
  getCard = (CID) => {
    const { pageno, pagesize } = this.state;
    var that = this;
    axios
      .get('/getUserItems', {
        params: {
          PSID: store.getState().PSID,
          pageno,
          pagesize,
          type: 'AssessItem' + 1,
          filterText: CID,
        },
      })
      .then((response) => {
        const total = response.data[0].total;
        const items = response.data.map((item, index) => {
          return { ...item, showImg: item.photopath.split(';')[0] };
        });
        that.setState({ items, total, dataSource2: items });
      });
  };

  getItemData = async (CID) => {
    const { PSID } = store.getState();
    let dataSource = [];
    await axios
      .get('/getGoods', {
        params: {
          id: PSID,
          CID,
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

  updateTreeData(list, key, children) {
    return list.map((node) => {
      if (node.key === key) {
        console.log(node, children);
        return { ...node, children };
      }

      if (node.children) {
        return {
          ...node,
          children: this.updateTreeData(node.children, key, children),
        };
      }

      return node;
    });
  }

  selectTreeNode = async (treeNode) => {
    if (treeNode.length === 0) {
      this.getItemData('C');
      this.getCard('');
    } else {
      this.getItemData(treeNode[0]);
      this.getCard(treeNode[0]);
    }
  };

  showDrawer = (record) => {
    const { SpeDetail, DocDetail, Specification, Documents, photopath } =
      record;
    let selectedTags = [];

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
    // console.log(SpecificationData)
    const DocDetailArr = DocDetail.split(';');
    const DocumentsArr = Documents.split(';');
    selectedTags = DocumentsArr;
    // console.log(selectedTags)

    let fileList = photopath.split(';');
    fileList = fileList.map((obj, index) => {
      return {
        url: obj,
        uid: index,
        key: index,
      };
    });
    this.setState({
      ...record,
      SpeDetailArr,
      DocDetailArr,
      SpecificationArr,
      DocumentsArr,
      SpecificationData,
      selectedTags,
      fileList,
    });
    this.setState({
      visible: true,
    });

    setTimeout(() => {
      this.formRef.current.setFieldsValue({
        ...record,
        canDistribute: record.canDistribute === '0' ? '否' : '是',
      });
    }, 200);
  };

  onClose = () => {
    this.setState({
      visible: false,
      PIID: '',
      itemName: '',
      title: '',
      SpeDetail: '',
      DocDetail: '',
      PSID: '',
      Specification: '',
      Documents: '',
      photopath: '',
      UnitPrice: '',
      Quantity: '',
      PriceOnSale: '',
      canDistribute: '',
      state: '',
      Discript: '',
    });
  };

  onLoadData = (treeNode) => {
    return new Promise(async (resolve) => {
      const { key } = treeNode;
      let children = [];
      await axios
        .get('/getCategory', {
          params: {
            ParentNode: treeNode.CID,
          },
        })
        .then((response) => {
          if (response.data.length === 0) {
            console.log('无数据');
          } else {
            children = response.data;
          }
        })
        .catch((error) => {
          console.log(error);
        });

      children = children.map((obj, index) => {
        return {
          ...obj,
          key: obj.CID,
          isLeaf: obj.isLeafNode === '0' ? false : true,
        };
      });

      const { TreeData } = this.state;
      let newtreeData = this.updateTreeData(TreeData, key, children);
      this.setState({
        TreeData: newtreeData,
      });
      resolve();
    });
  };

  handleSave = () => {
    const {
      selectedNode,
      Rate,
      flag,
      PawnDue,
      InterestRatio,
      StoreCost,
      OverdueCost,
      OtherCost,
      Notes,
    } = this.state;

    if (selectedNode === '') {
      message.warning('请先选择指定类目');
      return;
    }

    let data = {};
    if (
      flag &&
      (Rate === null || Rate === undefined) &&
      (Notes === null || Notes === undefined || Notes.trim() === '')
    ) {
      data = {
        PSID: store.getState().PSID,
        id: selectedNode.CID,
        operation: 'del',
      };
    } else if (
      flag &&
      ((Rate !== null && Rate !== undefined) ||
        (Notes !== null && Notes !== undefined && Notes.trim() === ''))
    ) {
      data = {
        PSID: store.getState().PSID,
        id: selectedNode.CID,
        Rate: Rate === null ? undefined : Rate,
        Notes: Notes === null ? undefined : Notes,
        operation: 'mod',
        PawnDue,
        InterestRatio,
        StoreCost,
        OverdueCost,
        OtherCost,
      };
    } else if (
      !flag &&
      ((Rate !== null && Rate !== undefined) ||
        (Notes !== null && Notes !== undefined && Notes.trim() !== ''))
    ) {
      data = {
        PSID: store.getState().PSID,
        id: selectedNode.CID,
        Rate: Rate === null ? undefined : Rate,
        Notes: Notes === null ? undefined : Notes,
        operation: 'add',
        PawnDue,
        InterestRatio,
        StoreCost,
        OverdueCost,
        OtherCost,
      };
    } else {
      message.warning('未作更新');
      return;
    }
    console.log(data);
    axios({
      method: 'post',
      url: 'http://localhost:3000/modAssessSD',
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
            description: <p>已成功设置类目估价折价率</p>,
            duration: 2,
          });
        }
      })
      .catch((error) => {
        notification['error']({
          message: '注意',
          description: error,
          duration: 2,
        });
      });
  };

  //切换页码
  handlePage = (e) => {
    console.log(e);
    this.setState(
      {
        pageno: e,
      },
      () => {
        this.getCard(); //setState()的callBack()参数
      }
    );
  };

  render() {
    const {
      TreeData,
      dataSource,
      dataSource2,
      items,
      total,
      pageno,
      pagesize,
    } = this.state;
    const {
      previewVisible,
      previewImage,
      previewTitle,
      fileList,
      SpeDetailArr,
      SpecificationArr,
      DocDetailArr,
      SpecificationData,
      selectedTags,
      PIID,
      itemName,
      title,
      photopath,
      Unitprice,
      Quantity,
      PriceOnSale,
      canDistribute,
      state,
      Discript,
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
          <Breadcrumb.Item>当物信息管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: '10 0' }}>
          <Layout style={{ height: '70vh' }}>
            <Sider
              theme="light"
              width={200}
              style={{ padding: 10, border: '1px solid #eee' }}
            >
              <Tree
                showLine
                switcherIcon={<DownOutlined />}
                loadData={this.onLoadData}
                treeData={TreeData}
                height={500}
                onSelect={this.selectTreeNode}
                style={{ paddingLeft: 10 }}
              />
            </Sider>
            <Content style={{ paddingLeft: 10, backgroundColor: 'white' }}>
              <Tabs onChange={this.handleTab} type="card">
                <TabPane tab="表格" key="tab1">
                  <Table
                    size="small"
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <p style={{ margin: 0 }}>
                          规格详情: {record.Specification}
                          <br />
                          附件: {record.Documents}
                        </p>
                      ),
                      rowExpandable: (record) =>
                        record.Specification !== '' || record.Documents !== '',
                    }}
                    onRow={(record) => {
                      return {
                        onDoubleClick: (event) => {
                          this.showDrawer(record);
                        },
                      };
                    }}
                  />
                </TabPane>
                <TabPane tab="卡片" key="tab2">
                  <Card>
                    {dataSource2.map((obj, index) => {
                      return (
                        <Card.Grid
                          className="box"
                          style={gridStyle}
                          key={index}
                        >
                          <div
                            className="up"
                            style={{
                              backgroundImage: `url(${
                                obj.showImg
                                  ? obj.showImg
                                  : 'https://ww1.sinaimg.cn/large/007rAy9hgy1g24by9t530j30i20i2glm.jpg'
                              })`,
                              backgroundSize: '100% 100%',
                            }}
                          >
                            {obj.title}
                          </div>
                          <div className="mask">
                            <div className="infoDiv">
                              <div className="info">当品名称：{obj.title}</div>
                              <div className="info">当品编码：{obj.UIID}</div>
                              <div className="info">
                                规格详情：
                                {obj.Specification ? obj.Specification : '无'}
                              </div>
                              <div className="info">
                                所含附件：{obj.Documents ? obj.Documents : '无'}
                              </div>
                              <div className="info">
                                附加描述：{obj.Discript ? obj.Discript : '无'}
                              </div>
                            </div>
                            {/* <Button onClick={()=>this.handleService(0,obj)}>鉴定</Button>
                                      <Button onClick={()=>this.handleService(1,obj)}>估价</Button> */}
                          </div>
                        </Card.Grid>
                      );
                    })}
                    {/* <Card.Grid hoverable={false} style={gridStyle}>
                              Content
                            </Card.Grid> */}
                  </Card>
                  <Pagination
                    className="page"
                    size="small"
                    current={pageno}
                    pageSize={pagesize}
                    total={total}
                    showSizeChanger={false}
                    onChange={this.handlePage}
                  />
                </TabPane>
              </Tabs>
            </Content>
          </Layout>
        </div>
        <Drawer
          title="编辑当品信息"
          width={320}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
          extra={
            <Space>
              {/* <Button onClick={this.onClose}>取消</Button> */}
              <Button onClick={this.onSubmit} type="primary">
                确定
              </Button>
            </Space>
          }
        >
          <Form
            layout="horizontal"
            ref={this.formRef}
            hideRequiredMark
            initialValues={{
              PIID,
              title,
              Discript,
              Quantity,
              Unitprice,
              canDistribute,
              ...SpecificationData,
              Documents: selectedTags,
            }}
          >
            <Form.Item
              name="PIID"
              label="编号"
              rules={[{ required: true, message: '请输入当品编号' }]}
            >
              <Input
                value={PIID}
                placeholder="请输入当品编号"
                onChange={this.handleID}
              />
            </Form.Item>
            <Form.Item name="itemName" label="名称">
              <Input
                value={itemName}
                onChange={(e) => {
                  this.setState({ itemName: e.target.value });
                }}
              />
            </Form.Item>
            <Form.Item name="title" label="类别">
              <Input value={title} onChange={this.handletitle} />
            </Form.Item>
            <Form.Item name="Quantity" label="单位">
              <Input value={Quantity} onChange={this.handleQuantity} />
            </Form.Item>
            <Form.Item name="PriceOnSale" label="售价">
              <Input
                value={PriceOnSale}
                onChange={(e) => this.setState({ PriceOnSale: e.target.value })}
              />
            </Form.Item>
            <Form.Item name="canDistribute" label="配送">
              <Input
                value={canDistribute}
                onChange={this.handleCanDistribute}
              />
            </Form.Item>
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
                  name={obj}
                  label={obj}
                  rules={[{ required: true, message: '请输入' + obj }]}
                  value={value}
                >
                  <Input
                    value={value}
                    placeholder={'请输入' + obj}
                    onChange={this.handlePIID}
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
              label="照片"
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
                {fileList.length >= 9 ? null : uploadButton}
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
              name="Discript"
              label="简介"
              rules={[
                {
                  required: true,
                  message: '请输入简介',
                },
              ]}
            >
              <Input.TextArea
                rows={3}
                value={Discript}
                onChange={this.handleDiscript}
                placeholder="请输入简介"
              />
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    );
  }
}
