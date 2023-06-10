import React, { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import styles from './BaseView.less';
import { currentUser, updateLoginUser } from "@/services/ant-design-pro/api";

// 头像组件 方便以后独立，增加裁剪之类的功能
const AvatarView = ({ avatarUrl }: { avatarUrl: string }) => (
  <>
    <div className={styles.avatar_title}>头像</div>
    <div className={styles.avatar}>
      <img src={avatarUrl} alt="avatarUrl" />
    </div>
    <Upload showUploadList={false}>
      <div className={styles.button_view}>
        <Button>
          <UploadOutlined />
          更换头像
        </Button>
      </div>
    </Upload>
  </>
);

const BaseView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loginUser, setLoginUser] = useState<API.CurrentUser | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const response = await currentUser();
      console.log(response)
      if (response) {
        // 获取到当前用户数据
        setLoginUser(response);
      } else {
        // 处理获取用户数据失败的情况
        console.error('Failed to fetch current user data:');
      }
    } catch (error) {
      console.error('Failed to fetch current user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const getAvatarURL = () => {
    if (loginUser && loginUser.avatarUrl) {
      return loginUser.avatarUrl;
    }
    return 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
  };

  const handleFinish = async (fields: API.CurrentUser) => {
    const hide = message.loading('正在修改');
    try {
      await updateLoginUser({
        ...fields,
      });
      hide();
      message.success('修改成功');
      return true;
    } catch (error) {
      hide();
      message.error('修改失败请重试！');
      return false;
    }
  };

  return (
    <div className={styles.baseView}>
      {!loading && (
        <>
          <div className={styles.left}>
            <ProForm
              layout="vertical"
              onFinish={async (value) => {
                const success = await handleFinish({
                  ...value,
                  id: loginUser.id,
                });
              }}
              submitter={{
                resetButtonProps: {
                  style: {
                    display: 'none',
                  },
                },
                submitButtonProps: {
                  children: '更新基本信息',
                },
              }}
              initialValues={{
                ...loginUser,
              }}
            >
              <ProFormText
                width="md"
                name="username"
                label="昵称"
                rules={[
                  {
                    required: true,
                    message: '请输入您的昵称!',
                  },
                ]}
              />
              <ProFormText
                width="md"
                name="userAccount"
                label="账号"
                rules={[
                  {
                    required: true,
                    message: '请输入您的账号!',
                  },
                ]}
                initialValue={loginUser.userAccount}
              />
              <ProFormSelect
                width="sm"
                name="gender"
                label="性别"
                rules={[
                  {
                    required: true,
                    message: '请选择您的性别!',
                  },
                ]}
                initialValue={loginUser.gender}
                value={String(loginUser.gender)}
                options={[
                  {
                    label: '男',
                    value: 0,
                  },
                  {
                    label: '女',
                    value: 1,
                  },
                ]}
                labelRender={(option) => option.value === 0 ? '男' : '女'}
              />
              <ProFormText
                width="md"
                name="phone"
                label="联系方式"
                rules={[
                  {
                    required: false,
                    message: '请填写您的联系方式!',
                  },
                ]}
                initialValue={loginUser.phone}
              />
              <ProFormText
                width="md"
                name="email"
                label="邮箱"
                rules={[
                  {
                    required: true,
                    message: '请输入您的邮箱!',
                  },
                ]}
                initialValue={loginUser.email}
              />
            </ProForm>
          </div>
          <div className={styles.right}>
            <AvatarView avatarUrl={getAvatarURL()} />
          </div>
        </>
      )}
    </div>
  );
};

export default BaseView;
