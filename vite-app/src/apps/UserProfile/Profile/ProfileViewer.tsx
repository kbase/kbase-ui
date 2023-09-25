import {
    EditOutlined,
    ExclamationOutlined
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Col,
    Empty,
    Image,
    List,
    Modal,
    Row,
    Space,
    Spin,
    Tooltip
} from 'antd';
import Link from 'antd/es/typography/Link';
import { image } from 'components/images';
import DOMPurify from 'dompurify';
import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { changeHash2 } from 'lib/navigation';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';
import { UserProfileAffiliation } from '../API';
import { ORCID_URL } from '../constants';
import Area from './Area';
import Orgs from './Orgs/controller';
import './Profile.css';
import { ORCIDState, OrgsState, ProfileView } from './controller';


export interface ProfileProps {
    profileView: ProfileView;
    orcidState: ORCIDState;
    orgsState: OrgsState;
    uiOrigin: string;
    checkORCID: (username: string) => void;
    fetchProfile: (username: string) => void;
    toggleEditing: () => void;
}

export type KeyOfType<Type, ValueType> = keyof {
    [Key in keyof Type as Type[Key] extends ValueType ? Key : never]: unknown;
};

export interface FormDataAffiliation {
    title: string
    organization: string
    started: string
    ended?: string | null
}

export interface FormData {
    avatarOption: string
    gravatarDefault?: string
    jobTitle?: string
    jobTitleOther?: string
    department?: string
    organization?: string
    country?: string
    state?: string
    city?: string
    postalCode?: string
    fundingSource?: string
    researchStatement?: string
    researchInterests?: Array<string>
    researchInterestsOther?: string
    affiliations?: Array<FormDataAffiliation>
    showORCIDId: boolean
}

// Note that this should be exported from antd
// TODO: investigate and possibly create issue on github; stretch - create PR.


export interface ReturnLink {
    type: string;
    origin: string;
    id: string;
    label: string;
}

/**
 * Returns profile component.
 * @param props
 */
// class Profile extends React.Component<ProfileProps, ProfileState> {
function ProfileViewer(props: ProfileProps) {
    function enableEditing() {
        props.toggleEditing()
    }

    function renderUserNutshellViewEmpty() {
        return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No User Profile" />
        );
    }

    function renderSection(title: string, body: string | undefined | JSX.Element) {
        return <div className="Profile-section">
            <div className="Profile-section-title">
                {title}
            </div>
            <div className="Profile-section-body">
                {body}
            </div>
        </div>;
    }

    function renderJobTitleView() {
        if (props.profileView.profile.userdata.jobTitle) {
            renderSection('position',
                props.profileView.profile.userdata.jobTitle === 'Other' ? props.profileView.profile.userdata.jobTitleOther : props.profileView.profile.userdata.jobTitle
            )
        }
    }

    function renderLocationSection() {
        const { profileView: { profile } } = props;
        const location = (() => {
            if (profile.userdata.country === 'United States') {
                return [profile.userdata.country, profile.userdata.state, profile.userdata.city].filter(x => x).join(', ');
            } else {
                return [profile.userdata.country, profile.userdata.city].filter(x => x).join(', ');
            }
        })();

        if (!location) {
            return;
        }

        return renderSection('location', location);
    }

    function renderDepartmentSection() {
        if (!props.profileView.profile.userdata.department) {
            return;
        }
        return renderSection('department', props.profileView.profile.userdata.department)
    }

    function renderOrganizationSection() {
        if (!props.profileView.profile.userdata.organization) {
            return;
        }
        return renderSection('organization', props.profileView.profile.userdata.organization);
    }

    function renderFundingSourceSection() {
        if (!props.profileView.profile.userdata.fundingSource) {
            return;
        }
        return renderSection('primary funding source', props.profileView.profile.userdata.fundingSource);
    }

    function isNutshellEmpty() {
        const { profile: { userdata: { jobTitle, department, organization, fundingSource, country, state, city } } } = props.profileView;
        if (jobTitle || department || organization || fundingSource) {
            return false;
        }
        if (country === 'United States') {
            if (country || state || city) {
                return false;
            }
        } else {
            if (country || city) {
                return false;
            }
        }
        return true;
    }

    function renderUserNutshellView() {
        if (isNutshellEmpty()) {
            return renderUserNutshellViewEmpty();
        }

        return <>
            {renderJobTitleView()}
            {renderDepartmentSection()}
            {renderOrganizationSection()}
            {renderFundingSourceSection()}
            {renderLocationSection()}
        </>;
    }

    /**
     * builds User Nutshell card
     *  - Choose between the non-auth user profile  
     *    vs. editable user profile 
     *  - Return either form or plain text
     */
    function renderUserNutshell() {
        return renderUserNutshellView();
    }



    /**
     * builds research statement card
     *  - Choose between the non-auth user profile  
     *    vs. editable user profile 
     *  - Return either form or plain text
     */
    function renderResearchStatement() {
        let statement;
        const { profile: { userdata: { researchStatement } } } = props.profileView;
        if (!researchStatement || researchStatement === '') {
            statement = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Research Statement" />;
        } else {
            // const fixed = this.props.profileUserdata.researchStatement.replace(/\n/, '<br />');
            // statement = <p style={{ whiteSpace: 'pre' }}>{this.props.profileUserdata.researchStatement}</p>;
            marked.use({
                breaks: true
            });
            const content = DOMPurify.sanitize(marked.parse(researchStatement));
            statement = <div dangerouslySetInnerHTML={{ __html: content }} />;
        }

        return statement;
    }

    function renderAffiliationsView() {
        const affiliations = props.profileView.profile.userdata.affiliations;

        // non-empty array

        // TODO: not sure about that last case -- at least explain it
        if (!affiliations || affiliations.length === 0 || affiliations[0]['title'] === '')
            return (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Affiliations" />
            );

        affiliations.sort((a: UserProfileAffiliation, b: UserProfileAffiliation) => {
            const startedSort = a.started - b.started;
            if (startedSort !== 0) {
                return startedSort;
            }

            const endedSort = (() => {
                if (!a.ended) {
                    return -1;
                }
                if (!b.ended) {
                    return 1;
                }
                return a.ended - b.ended;
            })();

            if (endedSort !== 0) {
                return endedSort;
            }

            const titleSort = a.title.localeCompare(b.title);
            if (titleSort !== 0) {
                return titleSort;
            }

            return a.organization.localeCompare(b.organization);
        });

        return (
            <table className="LayoutTable">
                <thead>
                    <tr>
                        <th style={{ width: "30%" }}>position</th>
                        <th style={{ width: "40%" }}>organization</th>
                        <th style={{ width: "30%" }}>tenure</th>
                    </tr>
                </thead>
                <tbody>
                    {affiliations
                        .filter(affiliation => affiliation.title)
                        .map((affiliation, index) => {
                            return <tr key={index}>
                                <td>{affiliation.title}</td>
                                <td>{affiliation.organization}</td>
                                <td>{affiliation.started} - {affiliation.ended ? affiliation.ended : 'present'}</td>
                            </tr>;
                        })}
                </tbody>
            </table>
        );
    }

    function renderAffiliations() {
        return renderAffiliationsView();
    }

    /**
     *   event Handlers
     *
     * 
     */


    // AVATAR

    function gravatarURL(gravatarHash: string, gravatarDefault: string) {
        return `https://www.gravatar.com/avatar/${gravatarHash}?s=300&amp;r=pg&d=${gravatarDefault}`;
    }

    function avatarImageSrc(avatarOption: string, gravatarDefault: string | null, gravatarHash?: string): string {
        switch (avatarOption) {
            case 'silhouette':
                // Opting out of gravatar causes this one image to be shown, in all cases.
                return image('nouserpic');
            case 'gravatar':
                if (!gravatarHash) {
                    // Should never occur, but may in some old test profiles.
                    return image('nouserpic');
                }
                return gravatarURL(gravatarHash, gravatarDefault || 'identicon');
            default:
                // should never occur, but may in some old test profiles.
                return image('nouserpic');
        }
    }


    // Set gravatarURL
    function avatarImageSrcView(): string {
        const { userdata: { avatarOption, gravatarDefault }, gravatarHash } = props.profileView.profile;
        return avatarImageSrc(avatarOption, gravatarDefault || null, gravatarHash);
    }


    function renderAvatarImage(srcRenderer: () => string) {
        return <Image
            style={{ maxWidth: '100%', alignSelf: 'center' }}
            fallback={image('nouserpic')}
            alt='User avatar'
            preview={false}
            src={srcRenderer()}
        />

    }

    function renderAvatarView() {
        return renderAvatarImage(avatarImageSrcView)
    }

    function renderAvatar() {
        return <div className="ProfileAvatar">
            <div className="ProfileAvatar-Avatar">
                {renderAvatarView()}
            </div>
        </div>
    }
    function onORCIDLink() {
        // open window, without much or any window decoration.
        const eventId = uuidv4();
        // const url = new URL(`${document.location.origin}#orcidlink/link`);
        // TODO: for better ergonomics in development, should be able to get the
        // kbase environment host from the config...

        const url = new URL(props.uiOrigin);
        // const url = new URL(window.location.href);
        url.hash = '#orcidlink/link';

        // TODO: if this works, we can give the window a unique uuid name when the app loads.
        window.name = "FOOBAR";

        // {id: string} is the ReturnFromWindow type expected by ORCIDLink.
        const origin = window.location.origin;
        // const origin = "https://ci.kbase.us";
        url.searchParams.set('ui_options', "hide-ui");
        url.searchParams.set('return_link', JSON.stringify({
            type: 'window',
            origin,
            id: eventId,
            label: 'User Profile'
        }));
        const newWindow = window.open(url.toString(), '_blank', "popup,width=1079,height=960");
        if (newWindow === null) {
            // what to do?
            // return <Alert type="error" message="Cannot open new window for linking" />
            console.error('Cannot open new window for linking');
            return;
        }

        const handleEvent = ({ data }: MessageEvent<ReturnLink>) => {
            if (typeof data === 'object' && data !== null) {
                const { id } = data;
                if (eventId === id) {
                    // this.evaluate();
                    // do something here...
                    props.checkORCID(props.profileView.user.username);
                    props.fetchProfile(props.profileView.user.username);
                    if (newWindow) {
                        newWindow.close();
                        window.removeEventListener('message', handleEvent);
                    }
                }
            }
        };
        window.addEventListener('message', handleEvent);
    }

    function getLinkingLink() {
        const linkingURL = new URL(`${props.uiOrigin}/#orcidlink/link`);
        const returnURL = (() => {
            if (window.parent) {
                return new URL(window.parent.location.href);
            } else {
                return new URL(window.location.href);
            }
        })();
        const returnLink = {
            type: 'link',
            url: returnURL.toString(),
            label: 'User Profile'
        }
        linkingURL.searchParams.set('return_link', JSON.stringify(returnLink));
        const hash = linkingURL.hash;
        const query = linkingURL.search;
        return `${hash}${query}`
    }

    function onORCIDLink2() {
        // const onOk = () => {
        //     window.location.href = getLinkingLink();
        // }

        // Modal.confirm({
        //     title: 'Proceed to ORCID Link',
        //     onOk,
        //     content: <>
        //         <p>
        //             In order to create your ORCID Link, your browser will leave this page, then return
        //             to it when you have completed the linking process.
        //         </p>
        //     </>
        // });
        changeHash2(window.location.href = getLinkingLink());
    }

    function renderControls() {
        if (!props.profileView.editEnable) {
            return;
        }

        const warnings = (() => {
            if (props.profileView.warnings.length > 0) {
                const showWarnings = () => {
                    Modal.warning({
                        title: 'Warnings',
                        content: <List bordered dataSource={props.profileView.warnings}
                            renderItem={(warning) => {
                                return <List.Item>{warning}</List.Item>
                            }} />
                    })
                }
                return <Button type="dashed"
                    icon={<ExclamationOutlined />}
                    onClick={showWarnings}
                >Warnings</Button>
            }
        })();

        let button;

        // const orcidLinkButton = (() => {
        //     if (props.orcidState.status === AsyncProcessStatus.SUCCESS) {
        //         if (props.orcidState.value.orcidId) {
        //             return;
        //         }
        //         return <Tooltip title="Click this button to link your KBase account to your ORCID account">
        //             <Button onClick={onORCIDLink}>Link to ORCID (popup)</Button>
        //         </Tooltip>
        //     }
        // })();
        const orcidLinkButton2 = (() => {
            if (props.orcidState.status === AsyncProcessStatus.SUCCESS) {
                if (props.orcidState.value.orcidId) {
                    return;
                }
                return <Tooltip title="Click this button to link your KBase account to your ORCID® account">
                    <Button onClick={(ev) => {
                        if (ev.altKey) {
                            onORCIDLink()
                        } else {
                            onORCIDLink2()
                        }
                    }} >Create KBase ORCID® Link...</Button>
                </Tooltip>
            }
        })();
        button = <Space wrap >
            <Button
                icon={<EditOutlined />}
                type="primary"
                // style={{ display: 'inline-flex', alignItems: 'center' }}
                onClick={enableEditing}>
                Edit Profile
            </Button>
            {/* {orcidLinkButton} */}
            {orcidLinkButton2}
            {warnings}
        </Space>;

        return <div className="ButtonBar">
            <div className="ButtonBar-button">{button}</div>
        </div>;
    }

    function renderResearchInterests() {
        return renderResearchInterestsView();
    }

    function renderResearchInterestsView() {
        const researchInterests = props.profileView.profile.userdata.researchInterests;
        if (Array.isArray(researchInterests) &&
            researchInterests.length > 0) {
            const normalized = researchInterests.map((interest) => {
                if (interest === 'Other') {
                    return props.profileView.profile.userdata.researchInterestsOther || interest;
                } else {
                    return interest;
                }
            });
            normalized.sort((a, b) => {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });

            return (
                <ul className="PrettyList" >
                    {normalized.map((interest) => {
                        return <li key={interest}>{interest}</li>;
                    })}
                </ul>
            );
        } else {
            return (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No Research Interests" />
            );
        }
    }

    function renderORCIDIcon() {
        return <img
            src={image('orcidIcon')}
            alt="ORCID® icon"
            style={{ height: '24px', marginRight: '0.25em', flex: '0 0 auto' }} />
    }

    function renderORCIDIdLink(orcidId: string) {
        return <Link href={`${ORCID_URL}/${orcidId}`} target="_blank" rel="noreferrer" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {renderORCIDIcon()}
            <div style={{ flex: '1 1 0' }}>
                {ORCID_URL}/{orcidId}
            </div>
        </Link>;
    }

    function renderORCIDIdLinkView(orcidId: string) {
        if (!props.profileView.profile.preferences?.showORCIDId.value) {
            return;
        }
        return renderORCIDIdLink(orcidId);
    }

    function renderORCIDId(orcidId: string | null) {
        if (orcidId) {
            return renderORCIDIdLinkView(orcidId);
        }
    }

    function showORCIDId(): boolean {
        const { orcidState } = props;
        switch (orcidState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
            case AsyncProcessStatus.ERROR:
                return false;
            case AsyncProcessStatus.SUCCESS:
                return !!(orcidState.value.orcidId && props.profileView.profile.preferences?.showORCIDId?.value && props.profileView.profile.preferences?.showORCIDId.value);
        }
    }

    function renderORCIDRow() {
        const { orcidState } = props;
        switch (orcidState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <tr><td colSpan={2}><Spin /></td></tr>;
            case AsyncProcessStatus.ERROR:
                // TODO: improve error - propagate error code.
                return <tr><td colSpan={2}><Alert showIcon type="error" message={orcidState.error.message} /></td></tr>;
            case AsyncProcessStatus.SUCCESS:
                if (orcidState.value.orcidId && props.profileView.profile.preferences?.showORCIDId?.value) {
                    return <tr>
                        <th>
                            ORCID® iD
                        </th>
                        <td>
                            {renderORCIDId(orcidState.value.orcidId)}
                        </td>
                    </tr>
                }
        }
    }

    function renderIdentityView() {
        return <div>
            <table className="PropertyTable" style={{ alignSelf: 'center' }}>
                <tbody>
                    <tr>
                        <th>
                            Username
                        </th>
                        <td>
                            <span data-k-b-testhook-element="username" className="ProfileAvatar-Username">{props.profileView.user.username}</span>
                        </td>
                    </tr>
                    {renderORCIDRow()}
                </tbody>
            </table>
        </div>
    }

    const {
        profile: {
            userdata: {
                affiliations: rawAffiliations
            }
        }
    } = props.profileView

    // Needs to be string for the input control.
    const affiliations = typeof rawAffiliations === 'undefined' ? [] : rawAffiliations
        .filter(({ started, title, organization }) => {
            return (title && title.length && organization && organization.length &&
                started);
        })
        .map(({
            started, ended, title, organization
        }) => {
            const affiliation: FormDataAffiliation = {
                title, organization,
                started: String(started)
            }
            if (ended) {
                affiliation.ended = String(ended);
            }
            return affiliation;

        });

    affiliations.sort((a: FormDataAffiliation, b: FormDataAffiliation) => {
        const startedSort = parseInt(a.started, 10) - parseInt(b.started, 10);
        if (startedSort !== 0) {
            return startedSort;
        }

        const endedSort = (() => {
            if (!a.ended) {
                return -1;
            }
            if (!b.ended) {
                return 1;
            }
            return parseInt(a.ended, 10) - parseInt(b.ended, 10);
        })();

        if (endedSort !== 0) {
            return endedSort;
        }

        const titleSort = a.title.localeCompare(b.title);
        if (titleSort !== 0) {
            return titleSort;
        }

        return a.organization.localeCompare(b.organization);
    });

    return (
        <div className="Profile">
            <div className="Profile-control-area" style={{ marginBottom: '10px' }}>
                {renderControls()}
            </div >
            <div className="Profile-content-area">

                <Row gutter={8} >
                    <Col span={showORCIDId() ? 8 : 6}>
                        <Area title={props.profileView.user.realname} >
                            <div style={{ marginBottom: '1rem' }}>
                                {renderIdentityView()}
                            </div>
                            {renderAvatar()}
                        </Area>
                    </Col>
                    <Col span={6} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Area title="Research Interests">
                            {renderResearchInterests()}
                        </Area>
                    </Col>
                    <Col span={10} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Area title='Organizations' scroll="auto">
                            <Orgs orgsState={props.orgsState} />
                        </Area>
                    </Col>
                </Row>
                <Row gutter={8} style={{ marginTop: '1rem' }}>
                    <Col span={7} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Area >
                            {renderUserNutshell()}
                        </Area>
                    </Col>
                    <Col span={7} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Area title='Research or Personal Statement'>
                            {renderResearchStatement()}
                        </Area>
                    </Col>
                    <Col span={showORCIDId() ? 10 : 12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Area title='Affiliations'>
                            {renderAffiliations()}
                        </Area>
                    </Col>
                </Row >
            </div>
        </div >
    );
}

export default ProfileViewer;
