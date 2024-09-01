import React from 'react';
import { Form, Input, Button, Radio, message, Select, Carousel } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../style/login.less';
import '../../style/iconfont.less';

const { Option } = Select;

axios.defaults.baseURL = 'http://localhost:8080/myDemo';

const options = [
  // { label: '普通用户', value: 'User' },
  // { label: '专家用户', value: 'Expert' },
  { label: '商务部人员', value: 'ComMem' },
  { label: '典当行人员', value: 'PSstaff' },
  { label: '平台管理员', value: 'Administrator' },
];

const contentStyle = {
  height: '160px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#364d79',
};

export default function Login() {
  const state = {
    userType: 'User',
    username: '',
    password: '',
    userinfo: {},
    userLogin: false,
  };
  const navigate = useNavigate();

  //单选框选择改变用户类型
  const onChange = (e) => {
    console.log(e);
    state.userType = e;
  };

  //表单完成提交
  const onFinish = (values) => {
    state.username = values.username;
    state.password = values.password;
    state.userType = values.usertype;

    axios
      .get('/VerifyUser', {
        params: {
          id: state.username,
          pwd: state.password,
          usertype: state.userType,
        },
      })
      .then((response) => {
        if (response.data.length === 0) {
          message.error('账号或密码错误');
        } else {
          state.userinfo = response.data[0];
          message.success(state.username + '成功登录');
          successLogin();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //登陆成功
  const successLogin = () => {
    const { userType } = state;
    if (userType === 'User') {
      sessionStorage.setItem('userinfo', JSON.stringify(state.userinfo));
      navigate(`users`, {
        state: { id: state.username, usertype: state.userType },
      });
    } else if (userType === 'Expert') {
      sessionStorage.setItem('userinfo', JSON.stringify(state.userinfo));
      navigate(`experts`, {
        state: { id: state.username, usertype: state.userType },
      });
    } else if (userType === 'ComMem') {
      sessionStorage.setItem('userinfo', JSON.stringify(state.userinfo));
      navigate(`commerce`, {
        state: { id: state.username, usertype: state.userType },
      });
    } else if (userType === 'PSstaff') {
      sessionStorage.setItem('userinfo', JSON.stringify(state.userinfo));
      navigate(`pawnshop`, {
        state: {
          id: state.username,
          usertype: state.userType,
          InServiceState: state.userinfo.InServiceState,
        },
      });
    } else if (userType === 'Administrator') {
      sessionStorage.setItem('userinfo', JSON.stringify(state.userinfo));
      navigate(`administrators`, {
        state: { id: state.username, usertype: state.userType },
      });
    }
    //navigate(`pawnshop`,{state:{...values}})
    // loginApi({
    //     username: values.username,
    //     password: values.password,
    // }).then(res=>{
    //     console.log(res)
    //     if(res.code===0){
    //         // console.log(res.data.token)
    //         setToken(res.data.token)
    //         props.history.push('/admin/wecome')
    //         message.success(res.msg)
    //     }else{
    //         message.error(res.msg)
    //     }
    // }).catch(err=>{
    //     message.error('服务器故障')
    // })
    state.userLogin = true;
  };

  return (
    <div className="login">
      <video
        id="Video"
        muted
        autoPlay="autoPlay"
        src="./web/video.mp4"
        loop="loop"
      >
        <source src="./web/video.mp4" type="video/mp4" />
      </video>

      <div className="carousel_div">
        <Carousel autoplay>
          <div>
            <img src="./web/png1.png" alt="" />
          </div>
          <div>
            <img
              src="https://p1.ssl.qhimg.com/dr/270_500_/t010d96112339819b27.png?size=773x593"
              alt=""
            />
          </div>
          <div>
            <img
              src="http://l.b2b168.com/2020/04/27/15/202004271524206671694.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              src="http://www.cdsxdd.com/Public/uploadfile/file/2016-06-24/576ca205876bf.jpg"
              alt=""
            />
          </div>
        </Carousel>
      </div>
      <div className="login-form">
        <div className="login-logo">
          <img src="./money.png" alt="" />
          <h2>典当行管理信息平台</h2>
        </div>
        <Form name="normal_login" onFinish={onFinish}>
          <Form.Item
            className="login_input"
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="账号"
              size="large"
            />
          </Form.Item>
          <Form.Item
            className="login_input"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="usertype"
            rules={[{ required: true, message: '请选择用户类型' }]}
          >
            {/* <Radio.Group
                        options={options}
                        onChange={onChange}
                        value={state.userType}
                        optionType="button"
                    /> */}
            <Select
              className="login_select"
              onChange={onChange}
              placeholder="请选择用户类型"
            >
              {options.map((item, i) => (
                <Option key={i} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              size="large"
            >
              登录
            </Button>
            <Button className="login-form-button" size="large">
              注册
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
