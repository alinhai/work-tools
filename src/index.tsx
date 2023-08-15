import React, { useState, useEffect, useMemo } from 'react';
import { Empty, Layout, Menu, theme } from 'antd';
import menu from './constants/menu';
import './index.css'
import Search from 'antd/es/input/Search';
import Title from 'antd/es/typography/Title';
import { LOGO } from './constants/images';

const { Content, Footer, Sider } = Layout;
const defaultMenu = { label: '', Component: () => (<></>) }

const App: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [menuList, setMenuList] = useState(menu);
  const [current, setCurrent] = useState('')

  const { label: title, Component } = useMemo(() => {
    return menu.find(({ key }) => key === current) || defaultMenu
  }, [current])

  const onSearch = (v: string) => {
    setMenuList(menu.filter(({ label }) => label.includes(v)));
  }

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = e.target.value
    !v && setMenuList(menu);
  }

  const onMenuClick = (item) => {
    setCurrent(item.key);
  }

  useEffect(() => {
    if (menuList.length) { 
      onMenuClick(menuList[0])
    }
  }, [menuList])

  return (
    <Layout hasSider>
      <Sider className='sider' collapsible >
        <div className="demo-logo-vertical" >
          <div className='logo-wrap'>
            <img src={LOGO} alt="work tools" />
            <Title className='title' level={5}>Work Tools</Title>
          </div>
          <Search
            placeholder="输入关键字搜索"
            onSearch={onSearch}
            onChange={onChange}
            enterButton
            allowClear
          />
        </div>
        {
          menuList.length ? (
            <Menu
              theme="dark"
              mode="inline"
              items={menuList}
              selectedKeys={[current]}
              onClick={onMenuClick}
            />
          ) : (
            <Empty
              className='empty'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description='Not Found'
            />
          )}
        
      </Sider>
      <Layout className="site-layout">
        <div style={{ background: colorBgContainer }} >
          <Title level={4}>{title}</Title>
        </div>
        <Content className='content' style={{ background: colorBgContainer }}>
          <Component />
        </Content>
        <Footer style={{ textAlign: 'center' }}>Work Tools ©2023 Created by Heidy</Footer>
      </Layout>
    </Layout>
  );
};

export default App;