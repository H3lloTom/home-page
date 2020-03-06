import React, { useRef } from 'react';

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
  EuiHeaderBreadcrumbs,
  EuiHeaderLogo,
  EuiIcon,
  EuiImage,
  EuiTitle,
  EuiNavDrawerGroup,
  EuiNavDrawer,
  EuiHorizontalRule,
  EuiShowFor,
  EuiFocusTrap,
  EuiButton
} from '@elastic/eui';
import { useLocation, useHistory } from 'react-router-dom';

// import { keyCodes } from '@elastic/eui/lib/services';

// import HeaderUserMenu from '../header/header_user_menu';
// import HeaderSpacesMenu from '../header/header_spaces_menu';

const Admin = props => {
  const location = useLocation();
  const navDrawerRef = useRef(null);
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
            iconType: 'discoverApp',
            extraAction: {
              color: 'subdued',
              iconType: 'starEmpty',
              iconSize: 's'
            }
          },
          {
            label: '入库',
            href: '#/purchase',
            isActive: pathname === '/purchase',
            iconType: 'visualizeApp',
            extraAction: {
              color: 'subdued',
              iconType: 'starEmpty',
              iconSize: 's'
            }
          },
          {
            label: '出库',
            href: '#/sale',
            isActive: pathname === '/sale',
            iconType: 'canvasApp',
            extraAction: {
              color: 'subdued',
              iconType: 'starEmpty',
              iconSize: 's'
            }
          }
        ]
      }
    }
  ];
  const onKeyDown = () => {};
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
          <EuiHeaderSection grow={false}>
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
                href="#/layout/nav-drawer"
                aria-label="Goes to home"
              />
            </EuiHeaderSectionItem>
            <EuiHeaderSectionItem border="right"></EuiHeaderSectionItem>
          </EuiHeaderSection>

          <EuiHeaderSection side="right">
            <EuiHeaderSectionItem></EuiHeaderSectionItem>
          </EuiHeaderSection>
        </EuiHeader>
        <EuiNavDrawer isLocked ref={navDrawerRef}>
          <EuiHorizontalRule margin="none" />
          <EuiNavDrawerGroup listItems={purchaseLinks} />
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
            <EuiPageContent>
              <EuiPageContentHeader>
                <EuiPageContentHeaderSection>
                  <EuiTitle>
                    <h2>{contentTitle}</h2>
                  </EuiTitle>
                </EuiPageContentHeaderSection>
              </EuiPageContentHeader>
              <EuiPageContentBody>{children}</EuiPageContentBody>
            </EuiPageContent>
          </EuiPageBody>
        </EuiPage>
      </div>
    </EuiFocusTrap>
  );
};

export default Admin;
