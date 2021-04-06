import { useRef, useEffect } from 'react';

export function Comments({ post }) {
  const commentsSection = useRef(null);

  useEffect(() => {
    const hasScript = commentsSection?.current.querySelector('.utterances');

    if (hasScript) {
      hasScript.remove();
    }

    const utteranceScript = document.createElement('script');

    utteranceScript.src = 'https://utteranc.es/client.js';
    utteranceScript.crossOrigin = 'anonymous';
    utteranceScript.async = true;
    utteranceScript.setAttribute('repo', 'Bluniz/Blog-com-NextJs-e-Prismic');
    utteranceScript.setAttribute('issue-term', 'title');
    utteranceScript.setAttribute('theme', 'github-dark');

    commentsSection.current?.appendChild(utteranceScript);
  }, [post]);

  return <footer ref={commentsSection} />;
}
/* export default class Comments extends Component {

  constructor(props) {
    super(props);
    this.commentBox = props.ref
  }
  componentDidMount() {
    let script = document.createElement('script');
    let anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', true);
    script.setAttribute('repo', 'Bluniz/Blog-com-NextJs-e-Prismic');
    script.setAttribute('label', 'Comment');
    script.setAttribute('issue-term', 'title');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }

  render() {
    return <div id="inject-comments-for-uterances"></div>;
  }
} */
