const ClusterV1 = require('../../services/cluster')

/**
 * @typedef {Object} State
 * @property {import('./user')} user
 */

/**
 * @extends {ClusterV1<State>}
 */
class Cluster extends ClusterV1 {

  /**
   * @param {string} teamId
   * @param {boolean} all
   * @return {Promise<Array>}
   */
  async getJobs (teamId, all, limit) {
    const { user } = this.context.state
    const params = new URLSearchParams({
      userName: user.email,
      vcName: teamId,
      jobOwner: all ? 'all' : user.email,
      num: limit
    })
    const response = await this.fetch('/ListJobsV2?' + params)
    this.context.assert(response.ok, 502)
    const data = await response.json()
    const jobs = [].concat(
      data['finishedJobs'],
      data['queuedJobs'],
      data['runningJobs'],
      data['visualizationJobs']
    )
    this.context.log.info('Got %d jobs from %s', jobs.length, this.id)
    return jobs
  }
}

module.exports = Cluster
