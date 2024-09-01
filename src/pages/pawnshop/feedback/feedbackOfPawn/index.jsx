import React, { Component } from 'react';
import axios from 'axios';
import store from '../../../../redux/store';
import Qs from 'qs';
import { Breadcrumb, Tabs } from 'antd';
import {
  Comment,
  Tooltip,
  List,
  Modal,
  Avatar,
  Form,
  Button,
  Input,
  message,
  notification,
} from 'antd';
import {
  SmileOutlined,
  CommentOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import moment from 'moment';

const { TabPane } = Tabs;
const { TextArea } = Input;

const Editor = ({ onChange, onSubmit, submitting, value }) => (
  <>
    <Form.Item>
      <TextArea rows={3} onChange={onChange} value={value} />
    </Form.Item>
  </>
);

export default class FeedbackOfPawn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      dataSource: [],
      count: 0,
      tabKey: '0',
      Phone: '',
      submitting: false,
      value: '',
      FBID: '',
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    let dataSource = [];

    await axios
      .get('/getFeedback', {
        params: {
          id: store.getState().PSID,
          FBAbout: 0,
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
        actions:
          obj.Rformat === undefined || obj.Rformat === ''
            ? [
                <span
                  key="comment-list-reply-to-0"
                  onClick={() => this.showModal(obj)}
                >
                  回复
                </span>,
              ]
            : '',
        author: obj.FBmember + ' ' + obj.UserName,
        avatar:
          obj.Gender === '0'
            ? 'https://joeschmoe.io/api/v1/male/random'
            : 'https://joeschmoe.io/api/v1/female/random',
        content: <p>{obj.FBContent}</p>,
        datetime: (
          <Tooltip
            title={moment(obj.FBDate).subtract(1, 'days').format('YYYY-MM-DD')}
          >
            <span>{moment(obj.FBDate).subtract(1, 'days').fromNow()}</span>
          </Tooltip>
        ),
      };
    });

    this.setState({
      dataSource,
      count: dataSource.length,
    });

    dataSource = dataSource.map((obj, index) => {
      const child = [
        {
          ...obj,
          key: index,
          actions: [
            <span key="comment-list-reply-to-0">
              {obj.State === '2'
                ? '已解决'
                : obj.State === '1'
                ? '已回复'
                : '未处理'}
            </span>,
          ],
          author: obj.PSName,
          avatar: 'https://joeschmoe.io/api/v1/shop',
          content: <p>{obj.RContent}</p>,
          datetime: (
            <Tooltip
              title={moment(obj.RDate).subtract(1, 'days').format('YYYY-MM-DD')}
            >
              <span>{moment(obj.FBDate).subtract(1, 'days').fromNow()}</span>
            </Tooltip>
          ),
        },
      ];
      return {
        ...obj,
        child,
      };
    });

    this.setState({
      dataSource,
      count: dataSource.length,
    });
  };

  showModal = (e) => {
    this.setState({
      visible: true,
      Phone: e.Phone,
      FBID: e.FBID,
    });
  };

  handleSubmit = () => {
    const { value, tabKey, FBID } = this.state;
    if (!value && tabKey === '0') {
      message.warning('未输入回复内容!');
      return;
    }

    this.setState({
      submitting: true,
      visible: false,
    });

    let data = {
      FBID,
      Rformat: tabKey,
      RContent: value,
    };

    axios({
      method: 'post',
      url: 'http://localhost:3000/modFeedback',
      data: Qs.stringify(data),
    })
      .then((response) => {
        notification.open({
          message: '消息',
          description: (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              反馈单&nbsp;{FBID}&nbsp;已回复~
            </div>
          ),
          icon: <SmileOutlined style={{ color: 'orange' }} />,
          duration: 2,
        });
      })
      .catch((error) => {
        console.log(error);
      });

    setTimeout(() => {
      this.setState({
        submitting: false,
        value: '',
      });
      this.getData();
    }, 1000);
  };

  handleChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  };

  render() {
    const { dataSource, visible, Phone, value } = this.state;

    return (
      <div>
        <Breadcrumb style={{ margin: '10px 16px' }}>
          <Breadcrumb.Item>反馈处理</Breadcrumb.Item>
          <Breadcrumb.Item>典当反馈处理</Breadcrumb.Item>
        </Breadcrumb>
        <div
          className="site-layout-background"
          style={{ padding: '16px', height: '70vh', overflow: 'auto' }}
        >
          <List
            className="comment-list"
            header={`${dataSource.length} 条反馈`}
            itemLayout="horizontal"
            dataSource={dataSource}
            renderItem={(item) => (
              <li>
                <Comment
                  actions={item.actions}
                  author={item.author}
                  avatar={item.avatar}
                  content={item.content}
                  datetime={item.datetime}
                >
                  {item.Rformat === undefined ? (
                    ''
                  ) : (
                    <List
                      className="comment-list"
                      itemLayout="horizontal"
                      dataSource={item.child}
                      renderItem={(item1) => (
                        <li>
                          <Comment
                            actions={[
                              <span key="comment-list-reply-to-0">
                                {item.State === '2'
                                  ? '已解决'
                                  : item.State === '1'
                                  ? '已回复'
                                  : '未处理'}
                              </span>,
                            ]}
                            author={item.PSName}
                            avatar="https://joeschmoe.io/api/v1/shop"
                            content={
                              item.Rformat === '1' ? (
                                <div>
                                  <p>
                                    回复方式：
                                    <span style={{ color: 'orange' }}>
                                      电联
                                    </span>
                                  </p>
                                </div>
                              ) : (
                                <p>{item.RContent}</p>
                              )
                            }
                            datetime={
                              <Tooltip
                                title={moment(item.RDate)
                                  .subtract(1, 'days')
                                  .format('YYYY-MM-DD')}
                              >
                                <span>
                                  {moment(item.FBDate)
                                    .subtract(1, 'days')
                                    .fromNow()}
                                </span>
                              </Tooltip>
                            }
                          ></Comment>
                        </li>
                      )}
                    />
                  )}
                </Comment>
              </li>
            )}
          />
          <Modal
            title="回复"
            centered
            visible={visible}
            onOk={this.handleSubmit}
            onCancel={() => {
              this.setState({ visible: false, FBID: '' });
            }}
            width={480}
            height={300}
            bodyStyle={{ paddingTop: 0, height: 200 }}
          >
            <Tabs
              defaultActiveKey="0"
              onChange={(e) => {
                this.setState({ tabKey: e });
              }}
            >
              <TabPane
                tab={
                  <span>
                    <CommentOutlined />
                    线上评论
                  </span>
                }
                key="0"
              >
                <Comment
                  avatar={
                    <Avatar
                      src="https://joeschmoe.io/api/v1/shop"
                      alt="Pawnshop"
                    />
                  }
                  content={
                    <Editor onChange={this.handleChange} value={value} />
                  }
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <PhoneOutlined />
                    电话联系
                  </span>
                }
                key="1"
              >
                {Phone}
              </TabPane>
            </Tabs>
          </Modal>
        </div>
      </div>
    );
  }
}
