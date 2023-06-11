import React, { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import styles from './BaseView.less';
import {currentUser, updateLoginUser, uploadAvatar} from "@/services/ant-design-pro/api";

// 头像组件 方便以后独立，增加裁剪之类的功能
const AvatarView = ({ avatarUrl, form }: { avatarUrl: string; form: any }) => {
  const [, setAvatarFile] = useState<File | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string>('');

  const handleAvatarChange = async (info: any) => {
    const { status, originFileObj } = info.file;
    if (status === 'done') {
      setAvatarFile(originFileObj);
      try {
        const url = await uploadAvatar(originFileObj);
        form.setFieldsValue({ avatarUrl: url });
        setUploadedAvatarUrl(url); // 保存上传成功后的头像 URL
        message.success('头像上传成功');
      } catch (error) {
        message.error('头像上传失败');
      }
    } else if (status === 'error') {
      message.error('头像上传失败');
    }
  };
  const avatarSrc = uploadedAvatarUrl || avatarUrl;

  return (
    <>
      <div className={styles.avatar_title}>头像</div>
      <div className={styles.avatar}>
        <img src={avatarSrc} alt="avatarUrl" />
      </div>
      <Upload showUploadList={false} onChange={handleAvatarChange}>
        <div className={styles.button_view}>
          <Button>
            <UploadOutlined />
            更换头像
          </Button>
        </div>
      </Upload>
    </>
  );
};

const BaseView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loginUser, setLoginUser] = useState<API.CurrentUser | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const response = await currentUser();
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
      await updateLoginUser(loginUser.id, {
        ...fields,
      });
      const updatedUser = await currentUser(); // 调用 currentUser 方法获取最新的用户数据
      if (updatedUser) {
        setLoginUser(updatedUser); // 更新 loginUser 的状态
        hide();
        message.success('修改成功');
        return true;
      } else {
        hide();
        message.error('修改失败请重试！');
        return false;
      }
    } catch (error) {
      hide();
      message.error('修改失败请重试！');
      return false;
    }
  };

  const [form] = ProForm.useForm(); // 添加这一行，创建 form 对象

  return (
    <div className={styles.baseView}>
      {!loading && (
        <>
          <div className={styles.left}>
            <ProForm
              form={form} // 添加这一行，将 form 对象传递给 ProForm
              layout="vertical"
              onFinish={async (value) => {
                const success = await handleFinish({
                  ...value,
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
                avatarUrl: getAvatarURL(), // 设置 avatarUrl 初始值
              }}
            >
              <ProForm.Item name="avatarUrl" hidden>
                <input type="hidden" />
              </ProForm.Item>
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
            <AvatarView avatarUrl={getAvatarURL()} form={form} /> {/* 将 form 对象传递给 AvatarView */}
          </div>
        </>
      )}
    </div>
  );
};

export default BaseView;
