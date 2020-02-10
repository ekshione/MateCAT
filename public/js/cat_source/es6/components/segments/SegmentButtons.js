/**
 * React Component .

 */
import React  from 'react';
import SegmentStore  from '../../stores/SegmentStore';
import SegmentFilter from "../header/cattol/segment_filter/segment_filter";
import SegmentUtils from "../../utils/segmentUtils";
import SegmentConstants from "../../constants/SegmentConstants";

class SegmentButton extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            progress: undefined
        };
        this.updateProgress = this.updateProgress.bind(this);

    }

    updateProgress(stats) {
        this.setState({
           progress: stats
        });
    }

    clickOnTranslatedButton(event) {
        this.props.updateTranslation();
        let target = event.currentTarget;
        setTimeout(()=>UI.clickOnTranslatedButton(target));
    }

    clickOnApprovedButton(event) {
        this.props.updateTranslation();
        let target = event.target;
        setTimeout(()=>UI.clickOnApprovedButton(target));
    }

    goToNextRepetition(event, status) {
        this.props.updateTranslation();
        let target = event.currentTarget;
        setTimeout(()=>SegmentFilter.goToNextRepetition(target, status));
    }

    goToNextRepetitionGroup(event, status) {
        this.props.updateTranslation();
        let target = event.currentTarget;
        setTimeout(()=>SegmentFilter.goToNextRepetitionGroup(target, status));
    }

    clickOnGuessTags(e) {
        e.preventDefault();
        this.props.updateTranslation();
        $(e.target).addClass('disabled');
        setTimeout(()=>UI.startSegmentTagProjection(this.props.segment.sid));
        return false;
    }

    getButtons() {
        let html;
        if (this.props.isReview){
            //Revise Default, Extended
            html = this.getReviewButtons()
        } else {
            //Translate
            html = this.getTranslateButtons()
        }
        return html;
    }

    getReviewButtons(){
        const classDisable = (this.props.disabled) ? 'disabled' : '';
        let nextButton, currentButton;
        let nextSegment = SegmentStore.getNextSegment(this.props.segment.sid, this.props.segment.fid);

        let revisionCompleted = false;
        if ( ReviewExtended.enabled() && this.state.progress ) {
            revisionCompleted = ( config.revisionNumber === 1 ) ? this.state.progress.revision1Completed : this.state.progress.revision2Completed
        } else if ( this.state.progress ) {
            revisionCompleted = this.state.progress.revisionCompleted;
        }
        let enableGoToNext = !_.isUndefined(nextSegment) && !revisionCompleted && nextSegment.autopropagated_from ==0;
        const filtering = (SegmentFilter.enabled() && SegmentFilter.filtering() && SegmentFilter.open);
        const className = ReviewExtended.enabled() ? "revise-button-" + ReviewExtended.number : '';
        enableGoToNext = ReviewExtended.enabled() ? enableGoToNext && !_.isNull(nextSegment.revision_number) && (
            nextSegment.revision_number === config.revisionNumber ||
            ( nextSegment.revision_number === 2 && config.revisionNumber === 1)
        )  : enableGoToNext && nextSegment.status.toLowerCase() === 'approved';
        nextButton = (enableGoToNext)? (
                <li>
                    <a id={'segment-' + this.props.segment.sid +'-nexttranslated'}
                       onClick={(event)=>this.clickOnApprovedButton(event)}
                       className={"btn next-unapproved "+ classDisable + " "+ className } data-segmentid={'segment-' + this.props.segment.sid}
                       title="Revise and go to next translated"> A+>>
                    </a>
                    <p>
                        {(UI.isMac) ? ('CMD') : ('CTRL')}
                        SHIFT+ENTER
                    </p>
                </li>) :
            (null);
        currentButton = <li><a id={'segment-' + this.props.segment.sid + '-button-translated'}
                               data-segmentid={'segment-' + this.props.segment.sid}
                               onClick={(event)=>this.clickOnApprovedButton(event)}
                               className={'approved ' + classDisable + " " + className} > {config.status_labels.APPROVED} </a><p>
            {(UI.isMac) ? 'CMD' : 'CTRL'} ENTER
        </p></li>;

        if (filtering) {
            nextButton = null;
            var data = SegmentFilter.getStoredState();
            var filterinRepetitions = data.reactState && data.reactState.samplingType === "repetitions";
            if (filterinRepetitions) {
                nextButton =<React.Fragment>
                    <li><a id={"segment-" + this.props.segment.sid+"-nextrepetition"}
                           onClick={(e)=>this.goToNextRepetition(e, 'approved')}
                           className={"next-review-repetition ui green button " + className}
                           data-segmentid={"segment-"+ this.props.segment.sid}
                           title="Revise and go to next repetition">REP ></a>
                    </li>
                    <li>
                        <a id={"segment-" + this.props.segment.sid +"-nextgrouprepetition"}
                           onClick={(e)=>this.goToNextRepetitionGroup(e, 'approved')}
                           className={"next-review-repetition-group ui green button " + className}
                           data-segmentid={"segment-" + this.props.segment.sid}
                           title="Revise and go to next repetition group">REP >></a>
                    </li>
                </React.Fragment>;

            }
        }
        return <ul className="buttons" data-mount="main-buttons" id={"segment-" + this.props.segment.sid + "-buttons"}>
            {nextButton}
            {currentButton}
        </ul>
    }


    getTranslateButtons(){
        const classDisable = (this.props.disabled) ? 'disabled' : '';

        let nextButton, currentButton;
        const filtering = (SegmentFilter.enabled() && SegmentFilter.filtering() && SegmentFilter.open);
        let nextSegment = SegmentStore.getNextSegment(this.props.segment.sid, this.props.segment.fid);
        let translationCompleted = ( this.state.progress && this.state.progress.translationCompleted );
        let enableGoToNext = !_.isUndefined(nextSegment) && ( nextSegment.status !== "NEW" && nextSegment.status !== "DRAFT" && nextSegment.autopropagated_from ==0 ) && !translationCompleted;
        //TODO Store TP Information in the SegmentsStore
        this.currentSegmentTPEnabled = SegmentUtils.checkCurrentSegmentTPEnabled(this.props.segment);
        if (this.currentSegmentTPEnabled) {
            nextButton = "";
            currentButton = <li>
                                <a id={'segment-' + this.props.segment.sid + '-button-guesstags'}
                                   onClick={(e)=>this.clickOnGuessTags(e)}
                                   data-segmentid={'segment-' + this.props.segment.sid}
                                    className={"guesstags " + classDisable} > GUESS TAGS
                                </a>
                            <p>
                                {UI.isMac ? ('CMD') : ('CTRL') }
                                ENTER
                            </p>
                        </li>;
        } else {
            nextButton = (enableGoToNext)? (
                <li>
                    <a id={'segment-' + this.props.segment.sid +'-nextuntranslated'} onClick={(e)=>this.clickOnTranslatedButton(e)}
                       className={"btn next-untranslated " + classDisable} data-segmentid={'segment-' + this.props.segment.sid}
                       title="Translate and go to next untranslated"> T+>>
                    </a>
                    <p>
                        {(UI.isMac) ? ('CMD') : ('CTRL')}
                        SHIFT+ENTER
                    </p>
                </li>) :
                (null);
            currentButton = this.getTranslateButton();
        }
        if (filtering) {
            nextButton = null;
            var data = SegmentFilter.getStoredState();
            var filterinRepetitions = data.reactState && data.reactState.samplingType === "repetitions";
            if (filterinRepetitions) {
                nextButton =<React.Fragment>
                            <li><a id={"segment-" + this.currentSegmentId+"-nextrepetition"}
                                   onClick={(e)=>this.goToNextRepetition(e, 'translated')}
                                   className="next-repetition ui primary button"
                                   data-segmentid={"segment-"+this.currentSegmentId}
                                   title="Translate and go to next repetition">REP ></a>
                            </li>
                            <li>
                                <a id={"segment-" + this.currentSegmentId +"-nextgrouprepetition"}
                                   onClick={(e)=>this.goToNextRepetitionGroup(e, 'translated')}
                                   className="next-repetition-group ui primary button"
                                    data-segmentid={"segment-" + this.currentSegmentId}
                                    title="Translate and go to next repetition group">REP >></a>
                            </li>
                    </React.Fragment>;

            }
        }

        return <ul className="buttons" data-mount="main-buttons" id={"segment-" + this.props.segment.sid + "-buttons"}>
            {nextButton}
            {currentButton}
        </ul>
    }

    getTranslateButton() {
        const classDisable = (this.props.disabled) ? 'disabled' : '';
        return <li><a id={'segment-' + this.props.segment.sid + '-button-translated'} onClick={(e)=>this.clickOnTranslatedButton(e)}
                      data-segmentid={'segment-' + this.props.segment.sid}
                      className={'translated ' +classDisable } > {config.status_labels.TRANSLATED} </a><p>
            {(UI.isMac) ? 'CMD' : 'CTRL'} ENTER
        </p></li>;
    }

    componentDidMount() {
        SegmentStore.addListener(SegmentConstants.SET_PROGRESS, this.updateProgress);
    }


    componentWillUnmount() {
        SegmentStore.removeListener(SegmentConstants.SET_PROGRESS, this.updateProgress);
    }

    render() {
        if ( this.props.segment.muted ) return '';
        return this.getButtons()
    }
}

export default SegmentButton;
