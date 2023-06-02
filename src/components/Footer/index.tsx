import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from 'umi';

const Footer: React.FC = () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: '王鸿颉出品',
  });

  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        // {
        //   key: 'Ant Design Pro',
        //   title: 'Ant Design Pro',
        //   href: 'https://www.code-nav.cn/',
        //   blankTarget: true,
        // },

        // {
        //   key: 'Ant Design',
        //   title: '编程导航',
        //   href: 'https://www.code-nav.cn/',
        //   blankTarget: true,
        // },
        {
          key: 'github',
          title: <><GithubOutlined /> 阿颉的github</>,
          href: 'https://github.com/XCGB/user-center-front-',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
