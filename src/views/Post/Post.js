import React from 'react';
import { EuiFormRow, EuiSearchBar } from '@elastic/eui';

const Post = () => {
  return (
    <div>
      <EuiFormRow fullWidth>
        <EuiSearchBar></EuiSearchBar>
      </EuiFormRow>
    </div>
  );
};

export default Post;
