import React, { useRef, useMemo, useState } from 'react';

import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageContentBody,
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiHeaderLogo,
  EuiIcon,
  EuiTitle,
  EuiNavDrawerGroup,
  EuiNavDrawer,
  EuiHorizontalRule,
  EuiShowFor,
  EuiFocusTrap,
  EuiPopover,
  EuiAvatar,
  EuiListGroup,
  EuiListGroupItem
} from '@elastic/eui';
import { useLocation, useHistory } from 'react-router-dom';
import AV from 'leancloud-storage';

import styles from './index.module.scss';

const Admin = props => {
  const location = useLocation();
  const history = useHistory();
  const navDrawerRef = useRef(null);
  const [isLogoutPopoverOpen, setLogoutPopoverOpen] = useState(false);
  const current = useMemo(() => AV.User.current());
  const { children, pageTitle, contentTitle } = props;
  const { pathname } = location;
  const purchaseLinks = [
    {
      label: '进销存',
      iconType: 'logoObservability',
      flyoutMenu: {
        title: '库存管理',
        listItems: [
          {
            label: '库存总量',
            href: '#/stock',
            isActive: pathname === '/stock',
            iconType: 'notebookApp'
          },
          {
            label: '商品库',
            href: '#/goods',
            isActive: pathname === '/goods',
            iconType: 'filebeatApp'
          },
          {
            label: '入库',
            href: '#/purchase',
            isActive: pathname === '/purchase',
            iconType: 'savedObjectsApp'
          },
          {
            label: '出库',
            href: '#/sale',
            isActive: pathname === '/sale',
            iconType: 'usersRolesApp'
          }
        ]
      }
    }
  ];
  const blogLinks = [
    {
      label: '博客',
      iconType: 'logoElasticStack',
      flyoutMenu: {
        title: '博客管理',
        listItems: [
          {
            label: '文章列表',
            href: '#/list',
            isActive: pathname === '/list',
            iconType: 'sqlApp'
          },
          {
            label: '新建文章',
            href: '#/edit',
            isActive: pathname === '/edit',
            iconType: 'addDataApp'
          }
        ]
      }
    }
  ];
  const onKeyDown = () => {};
  const onLogout = () => {
    AV.User.logOut();
    history.replace('/');
  };

  const username = current.getUsername();
  return (
    <EuiFocusTrap>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%'
        }}
        onKeyDown={onKeyDown}>
        <EuiHeader>
          <EuiHeaderSection grow>
            <EuiShowFor sizes={['xs', 's']}>
              <EuiHeaderSectionItem border="right">
                <EuiHeaderSectionItemButton
                  aria-label="Open nav"
                  onClick={() => navDrawerRef.current.toggleOpen()}>
                  <EuiIcon type="apps" href="#" size="m" />
                </EuiHeaderSectionItemButton>
              </EuiHeaderSectionItem>
            </EuiShowFor>
            <EuiHeaderSectionItem border="right">
              <EuiHeaderLogo
                iconType="logoRedis"
                href="#/"
                aria-label="Go home"
              />
            </EuiHeaderSectionItem>
            <EuiHeaderSectionItem border="right"></EuiHeaderSectionItem>
          </EuiHeaderSection>

          <EuiHeaderSection side="right">
            <EuiHeaderSectionItem>
              <EuiPopover
                panelPaddingSize="none"
                isOpen={isLogoutPopoverOpen}
                closePopover={() => setLogoutPopoverOpen(false)}
                button={
                  <EuiHeaderSectionItemButton
                    onClick={() => setLogoutPopoverOpen(true)}>
                    <EuiAvatar name={username}></EuiAvatar>
                  </EuiHeaderSectionItemButton>
                }>
                <EuiListGroup>
                  <EuiListGroupItem
                    label="登出"
                    onClick={onLogout}></EuiListGroupItem>
                </EuiListGroup>
              </EuiPopover>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>
        </EuiHeader>
        <EuiNavDrawer showExpandButton={false} isLocked ref={navDrawerRef}>
          <EuiHorizontalRule margin="none" />
          <EuiNavDrawerGroup listItems={purchaseLinks} />
          <EuiNavDrawerGroup listItems={blogLinks} />
        </EuiNavDrawer>
        <EuiPage className="euiNavDrawerPage">
          <EuiPageBody className="euiNavDrawerPage__pageBody">
            <EuiPageHeader>
              <EuiPageHeaderSection>
                <EuiTitle size="l">
                  <h1>{pageTitle}</h1>
                </EuiTitle>
              </EuiPageHeaderSection>
            </EuiPageHeader>
            <EuiPageContent className={styles.content}>
              {contentTitle && (
                <EuiPageContentHeader>
                  <EuiPageContentHeaderSection>
                    <EuiTitle>
                      <h2>{contentTitle}</h2>
                    </EuiTitle>
                  </EuiPageContentHeaderSection>
                </EuiPageContentHeader>
              )}
              <EuiPageContentBody className={styles.body}>
                {children}
              </EuiPageContentBody>
            </EuiPageContent>
          </EuiPageBody>
        </EuiPage>
      </div>
    </EuiFocusTrap>
  );
};

export default Admin;
