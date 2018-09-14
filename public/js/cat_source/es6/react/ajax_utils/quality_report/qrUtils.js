

let QUALITY_REPORT =  {

    getSegmentsFiles(filter, segmentId) {
        let data = {
            step: 10,
            ref_segment: segmentId,
        };
        if (filter) {
            data.filter = filter;
        }
        return $.ajax({
            data: data,
            type: "GET",
            url : "/api/v3/jobs/"+ config.id_job +"/" + config.password + "/quality-report/segments"
        });
    },

    getUserData() {
        return $.getJSON('/api/app/user');
    }
}

export default QUALITY_REPORT ;